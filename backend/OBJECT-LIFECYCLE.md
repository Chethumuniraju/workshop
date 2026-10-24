# Backend Object Lifecycle and Request Flows

This document describes when backend objects are created, how many of each
application-owned object exist, what they do, and when they can be released.
“Object count” below means objects explicitly created by this application;
Node.js, Express, Mongoose, the MongoDB driver, and the JavaScript runtime also
create internal objects whose count varies by implementation and request.

- Architecture and OOP overview: [README.md](./README.md)
- Application wiring: [`src/container.js`](./src/container.js)
- Server entry point: [`src/server.js`](./src/server.js)

## Lifetime categories

| Lifetime | Meaning in this application |
| --- | --- |
| Process/module lifetime | Created when Node loads a module; reused until the process exits (CommonJS caches loaded modules). |
| Per application process | One object of a wired application class per Node process, created by the container. |
| Per route registration | A middleware wrapper/closure is created while route modules are loaded, then reused for requests to that route. |
| Per HTTP request | Temporary request, response, validation result, auth user, errors, and call-local data; eligible for garbage collection after the request completes and references are gone. |
| Per database result | Mongoose document(s) hydrated from MongoDB; temporary in-memory representations of persisted records. |
| Per transaction | One MongoDB ClientSession for a transactional use-case invocation, ended in `finally`. |
| Persistent | MongoDB documents and indexes survive the Node process and requests until changed/deleted in the database. |
| Token lifetime | A signed JWT is created at login and remains usable until its one-hour expiry (unless the signing configuration or user checks invalidate it sooner). The backend does not store a server-side token object/session. |

## Startup and application object graph

```text
node src/server.js
  -> load config/env.js
  -> load src/app.js and route modules
  -> load src/container.js
       -> compile 3 Mongoose models
       -> construct 3 repository objects
       -> construct 3 service objects
       -> construct 3 controller objects
  -> connect to MongoDB
  -> create HTTP listener/server
```

`require()` module caching means repeated imports in this process normally
reuse the loaded modules and their exported objects. This count is **per Node
process**: starting two server processes creates two separate in-memory
containers, while both processes connect to the same database.

### Startup object inventory

| Object/type | Application count per process | Created when | Lifetime / released when |
| --- | ---: | --- | --- |
| Validated `env` object | 1 | `src/config/env.js` is first required; Joi validates `process.env`, then `Object.freeze` is applied. | Process/module lifetime. No secret values are documented here. |
| Mongoose `Schema` definitions | 3 | The User, Workshop, and Booking model modules are loaded. | Module lifetime. These are definitions, not individual records. |
| Mongoose model objects (`User`, `Workshop`, `Booking`) | 3 | `mongoose.model(name, schema)` runs once for each model module. | Process/module lifetime; they provide static query/create APIs. |
| Express application | 1 | `express()` runs in `src/app.js`. | Process lifetime; serves requests until shutdown. |
| Express routers | 3 | One `express.Router()` per auth, workshop, and booking route module. | Process/module lifetime; reused to match incoming routes. |
| Repository instances | 3 | `container.js` calls `new UserRepository`, `new WorkshopRepository`, and `new BookingRepository`. | Process lifetime; each holds a Mongoose model reference. |
| Service instances | 3 | `container.js` calls `new AuthService`, `new WorkshopService`, and `new BookingService`. | Process lifetime; each holds injected repository references. |
| Controller instances | 3 | `container.js` calls `new AuthController`, `new WorkshopController`, and `new BookingController`. | Process lifetime; each holds an injected service reference. |
| Route middleware closures | One per declaration/invocation | Route files call `validate(schema)`, `authorize(role)`, and `asyncHandler(handler)` during route setup. | Reused for each matching request; closures become collectible when the route/module graph is released. |
| HTTP server/listener | 1 | `app.listen()` runs after successful database connection. | Until `SIGINT`/`SIGTERM` graceful close or process termination. |
| Database connection/pool | 1 Mongoose connection for this app | `connectDatabase()` is called before listening. The MongoDB driver manages pooled sockets underneath. | Until the process exits (or an explicit disconnect in a standalone script). |

The named controller/service/repository objects are singletons **inside this
composition root**, not globally shared across machines or separate server
processes. They contain references to collaborators; they do not hold one
request's user or booking as mutable shared state.

## Object inventory by category

| Object | Typical count | Created at | Lifetime / end |
| --- | --- | --- | --- |
| Express `req`, `res`, and `next` context | One request/response context per incoming HTTP request. | Express receives the request. | Until response/error processing and outstanding references finish. |
| Joi validation result (`error`, `value`) | One result per validation middleware execution. | `validate.middleware.js` invokes `schema.validate()`. | Request-local; discarded after validation continues or fails. |
| Authenticated Mongoose `User` document | Zero or one per protected request. | `authenticate.middleware.js` verifies JWT, then `User.findById()` hydrates a result. | Request-local; discarded after downstream handlers finish. |
| `ApiError` | Zero or one propagated application error per failing path (may be wrapped/forwarded by runtime internals). | Validation, auth/role checks, services, or other code throws it. | Until error middleware serializes it and no references remain. |
| Request body/query/params values | One corresponding parsed input object for each request that supplies it. | Express JSON parser and route matching. | Request-local. Joi may replace the selected property with normalized/stripped values. |
| Controller/service/repository call locals | Varies by use-case; one set per invocation. | The corresponding request starts a handler/use-case/query. | After awaited work and response completion, subject to garbage collection. |
| Mongoose `Query` objects | Varies with repository method calls; often multiple per request (e.g. list + count). | A repository calls `find`, `findById`, `exists`, or similar. | Until awaited/consumed and no references remain. |
| Mongoose documents | Zero, one, or many per query result; one per returned record when hydrated, plus created/updated result documents when returned. | Mongoose executes a query or `create()` operation. | In-memory object is collectible when unreachable; the MongoDB record is persistent until changed/deleted. |
| MongoDB `ClientSession` | One per call to `BookingService.create()`, `BookingService.cancel()`, or `WorkshopService.delete()` that reaches `startSession()`. | `mongoose.startSession()` at the beginning of each transactional method. | `endSession()` runs in `finally` after transaction work. A session is not a reusable application singleton. |
| JWT string | One on each successful login response. | `jwt.sign()` in `AuthService.login()`. | Stateless credential valid for one hour by default; held by the client and sent on later requests. |
| Password hash string | One generated per account registration (and per seeded account update). | `bcrypt.hash(..., 12)` before persistence. | Stored in MongoDB as `passwordHash`; the selected Mongoose field is hidden by default. Plain submitted password should not be persisted. |
| Seed account/workshop input objects | A fixed seed array of three workshop definitions and one object per user seed call. | `scripts/seed.js` module/function execution. | Script memory until completion; upserted MongoDB records persist. |

### Important distinction: model vs document

`User`, `Workshop`, and `Booking` are Mongoose **models** (compiled
schema-backed APIs). They exist once per process and are used to query or
create records. A `User` document is a particular user row returned or
created through the User model. If a query returns 15 workshops, the result
contains up to 15 hydrated workshop documents; the model itself was not
recreated 15 times.

Database documents outlive the request and process. Their hydrated JavaScript
objects do not automatically: after the request's references are gone, the
garbage collector may reclaim them while their records remain in MongoDB.

## Request lifecycle

```text
HTTP request
  -> Express JSON/CORS middleware
  -> route matching
  -> authenticate (protected paths)
       -> verify JWT
       -> query User and attach req.user
  -> authorize (role-restricted paths)
  -> validate (Joi schema, when configured for this input)
  -> controller
  -> service
  -> repository -> Mongoose query/write -> MongoDB
  -> controller sends JSON/status
  -> request-local objects become collectible when no longer referenced
```

If any async middleware/controller rejects, `asyncHandler` forwards the error
to the next Express middleware. The final error handler converts `ApiError`
and validation failures into an HTTP response. A request receives one response
path: normal controller success or error middleware failure.

### Routes and middleware construction

Route modules are loaded during app setup. For example, `authorize("admin")`
creates an allowed-role closure when the route is registered; it does not
construct a new authorization class for every request. The closure is reused.
When a request arrives, Express calls that middleware function with the
request's `req`, `res`, and `next`.

`validate(schema)` and `asyncHandler(fn)` use the same pattern: the wrapper is
made once when routes are declared and is invoked for each matching request.
The invocation's return values, promises, request, and response data are
request-scoped.

## Detailed flow: registration and login

### Registration

1. The already-registered route middleware validates the request body with
   `registerSchema`; it trims/lowercases the email and rejects malformed
   fields before business logic.
2. `AuthController.register()` calls the process-scoped `AuthService` with
   this request's validated body.
3. `AuthService.register()` calls the injected `UserRepository` to check for an
   existing account. The repository creates a Mongoose query; MongoDB returns
   zero or one user document.
4. If an account exists, an `ApiError(409)` is created and forwarded.
5. Otherwise bcrypt creates a password hash. The repository's `create()` calls
   the User model to persist a new user document.
6. The unique email index is the final defense against two concurrent
   registrations. The service translates MongoDB duplicate key error `11000`
   into conflict `409`.
7. The service returns a safe profile object (no password/hash); the
   controller serializes it as JSON with status `201`.
8. The request-local body, query/document result, and response objects become
   collectible after request completion; the User record remains persistent.

### Login

1. Joi validates and normalizes email and checks password presence.
2. The controller invokes the long-lived AuthService; UserRepository queries
   by normalized email and explicitly selects the hidden password hash.
3. bcrypt compares the submitted password with the stored hash. A missing user
   and a wrong password both return the same 401 message.
4. On success, `jwt.sign()` creates a token string expiring after one hour.
   The response returns the token and safe user profile.
5. The backend does not create a login-session document or retain a per-user
   JWT object. Subsequent requests send the token back; auth middleware
   verifies it and loads the current user again.

## Detailed flow: booking creation

For each POST booking request:

1. Authentication middleware verifies the bearer token and creates/hydrates a
   request-local User document.
2. `authorize("user")` rejects admins and any other non-user role.
3. Route validation checks the workshop ID (hex ObjectId length 24).
4. The booking controller calls the process-scoped `BookingService` with the
   current user ID and workshop ID.
5. `BookingService.create()` opens one ClientSession and runs a transaction.
6. The workshop repository queries for the requested workshop. Its result is
   one hydrated Workshop document or no document.
7. The service rejects missing workshops (404) and past workshops (400).
8. BookingRepository checks for an existing active user/workshop pair. A
   result here is at most one active Booking document.
9. WorkshopRepository performs an atomic conditional update only when
   `bookedSeats < totalSeats` and the workshop is still upcoming. If no row is
   updated, the service reports the workshop full (409).
10. BookingRepository creates one Booking document in the same transaction.
    The partial unique index is an additional concurrency guard against two
    active bookings for the same pair.
11. If any transactional step fails, MongoDB aborts the transaction so the
    seat increment and booking insert do not diverge. Duplicate key error
    `11000` is translated to 409.
12. `finally` ends the ClientSession. The controller sends status `201`.
    Persisted workshop and booking records remain; temporary documents,
    queries, and session references can be reclaimed.

## Detailed flow: cancellation

1. Authenticate and authorize the user; validate the booking ID.
2. BookingController calls `BookingService.cancel(bookingId, userId)`.
3. The service opens one ClientSession and transaction.
4. BookingRepository loads the booking (one document or none).
5. The service returns 404 if missing, 403 if the booking belongs to another
   user, and 409 if it is already cancelled.
6. BookingRepository updates status to `cancelled`.
7. WorkshopRepository decrements `bookedSeats` only when it is greater than
   zero. A missing update becomes an error, causing the transaction to roll
   back.
8. The session ends in `finally`; the booking history remains in MongoDB and
   the freed seat is reflected in the persisted workshop.

## Detailed flow: admin workshop creation, update, and delete

- **Create:** role middleware blocks non-admins. Joi checks title,
  description/date/seat bounds. `WorkshopService` checks the date again,
  creates a Workshop with `bookedSeats: 0`, and returns it for a 201 response.
  No transaction session is created for this single create operation.
- **Update:** role middleware and Joi validation run first. The repository
  update uses a condition ensuring `bookedSeats <= totalSeats`; the service
  distinguishes a missing workshop (404) from an invalid seat reduction
  (409). Existing booked capacity cannot be cut away.
- **Delete:** the service creates one ClientSession, loads the workshop,
  checks for any booking history, and deletes only if no history exists, all
  in a transaction. `finally` ends the session. Existing related bookings
  prevent deletion so historical references are not silently lost.

## Process shutdown and seed lifecycle

`server.js` connects to MongoDB before opening the HTTP listener. On `SIGINT`
or `SIGTERM`, it calls `server.close()` so open HTTP work can finish before
exiting. A normal server shutdown does not delete any MongoDB records.

The standalone seed script has a different lifecycle: it validates seed
environment variables, connects, upserts three accounts and three sample
workshops, and disconnects from MongoDB in `finally`. The seed script's input
objects and password hashes are temporary; upserted records persist.

## Caveats worth stating in an interview

- JavaScript garbage collection is nondeterministic: “eligible for collection”
  is accurate; an exact deallocation timestamp is not knowable.
- An HTTP request can create a variable number of query/document/error
  objects. Only the wired application object counts are fixed above.
- Mongoose model and schema instances are process-scoped; MongoDB documents are
  persistent records; hydrated document objects are request/query-scoped.
- Transaction guarantees depend on MongoDB replica-set support, not only on
  the JavaScript code.
- The current application is layered and dependency-injected, but it does not
  have interface declarations, strict domain/infrastructure inversion,
  request-scoped DI, or a server-side JWT session store.
