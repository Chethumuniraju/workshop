# Backend Architecture and OOP Guide

This guide explains the backend that is implemented in this repository, how it
maps to the developer-trial requirements, and how to discuss its design in an
interview. It describes the current code; it does not claim patterns that the
project does not use.

- [Object lifecycle, request flows, and object counts](./OBJECT-LIFECYCLE.md)
- [Project setup, API, and the assignment checklist](../README.md)

## Short interview answer

> The backend is a Node.js 18+ and Express 4 plain-JavaScript modular monolith.
> It uses a layered structure: Express routes and middleware handle HTTP,
> controllers adapt requests and responses, services enforce application
> rules, repositories encapsulate MongoDB queries, and Mongoose models define
> persisted data. A composition root constructs the class-based controllers,
> services, and repositories with constructor injection. The code uses
> composition and encapsulation, but it does not use TypeScript/Java-style
> interfaces or an inheritance hierarchy. MongoDB transactions and conditional
> updates protect booking and seat-count consistency.

## Architecture

```text
HTTP client
   |
   v
src/app.js                         Express app, CORS, JSON, routers, errors
   |
   v
src/routes/*.routes.js             URL -> middleware -> controller
   |
   +--> validate.middleware.js     Joi input validation
   +--> authenticate.middleware.js JWT verification and user lookup
   +--> authorize.middleware.js    role check
   |
   v
src/controllers/*.controller.js    HTTP request/response adapter
   |
   v
src/services/*.service.js          application rules and transactions
   |
   v
src/repositories/*.repository.js   persistence/query boundary
   |
   v
src/models/*.model.js              Mongoose schemas and MongoDB collections
```

`src/container.js` is the composition root: it imports the Mongoose models,
constructs repository instances, injects those into service instances, then
injects services into controller instances. Route modules receive the prepared
controllers from that container.

This is a **layered, modular-monolith architecture with repository and service
layers**. It borrows ideas commonly associated with Clean Architecture, such as
separation of responsibilities and constructor injection, but it is not strict
Clean/Hexagonal Architecture: the services import Mongoose directly for
transactions, authentication middleware imports the User model directly, and
repositories depend directly on Mongoose models. There are no independent
domain ports/adapters or interface definitions.

### Responsibilities by layer

| Layer | Location | Responsibility |
| --- | --- | --- |
| Bootstrap | [`src/server.js`](./src/server.js), [`src/config/database.js`](./src/config/database.js) | Connect to MongoDB, start the HTTP server, and close it on shutdown signals. |
| Application composition | [`src/container.js`](./src/container.js) | Construct and wire the long-lived repositories, services, and controllers. |
| HTTP application | [`src/app.js`](./src/app.js) | Configure CORS and JSON parsing, mount routers, and install not-found/error handlers. |
| Routes | [`src/routes/`](./src/routes/) | Declare endpoints and compose authentication, authorization, and validation middleware. |
| Middleware | [`src/middleware/`](./src/middleware/) | Authenticate JWTs, enforce roles, validate inputs, and normalize errors. |
| Controllers | [`src/controllers/`](./src/controllers/) | Translate Express request data into service calls and service results into status codes/JSON. |
| Services | [`src/services/`](./src/services/) | Enforce use-case rules, such as booking eligibility, seat limits, and ownership. |
| Repositories | [`src/repositories/`](./src/repositories/) | Encapsulate persistence reads, writes, indexes' query usage, and optional transaction sessions. |
| Models | [`src/models/`](./src/models/) | Define MongoDB document shape, validation, references, timestamps, and indexes. |
| Input schemas | [`src/validators/`](./src/validators/) | Define Joi schemas for route inputs. |
| Shared utilities | [`src/utils/`](./src/utils/) | Provide the custom API error type and Express async-handler wrapper. |

## OOP concepts present in the code

### 1. Classes and objects

The backend uses JavaScript `class` syntax for its controller, service, and
repository types. The class definitions are constructors; `container.js`
creates the runtime objects from them.

Examples:

- [`AuthController`](./src/controllers/auth.controller.js)
- [`BookingController`](./src/controllers/booking.controller.js)
- [`WorkshopController`](./src/controllers/workshop.controller.js)
- [`AuthService`](./src/services/auth.service.js)
- [`BookingService`](./src/services/booking.service.js)
- [`WorkshopService`](./src/services/workshop.service.js)
- [`UserRepository`](./src/repositories/user.repository.js)
- [`BookingRepository`](./src/repositories/booking.repository.js)
- [`WorkshopRepository`](./src/repositories/workshop.repository.js)

For example, the `AuthService` class is one constructor/type definition. At
application startup, `container.js` creates an `authService` object with
`new AuthService({ userRepository })`. That object holds its repository in
`this.userRepository` and provides behavior through methods such as
`register()` and `login()`.

### 2. Encapsulation (by responsibility)

Each layer owns a focused set of decisions:

- Controllers own HTTP response formatting and status codes.
- Services own business decisions: for example, `BookingService.create()`
  checks the workshop date and duplicate booking before reserving a seat.
- Repositories own Mongoose query details.
- Models own persisted-field constraints and indexes.

This is **logical encapsulation**, not strict private-field encapsulation:
properties such as `this.bookingRepository` are ordinary JavaScript properties,
not `#private` fields. The separation still reduces how much each layer needs
to know about the others.

### 3. Abstraction

Callers use methods such as `bookingService.create()` or
`bookingRepository.findByUser()` rather than placing database queries in route
handlers. The repository method names hide query construction from the service,
and services hide use-case rules from controllers.

This is an abstraction by module and method boundary. It is **not** a formal
interface: JavaScript does not check that a supplied object implements a
declared contract at compile time.

### 4. Composition and dependency injection

The main OOP technique is **composition**: an object holds collaborating
objects instead of inheriting their behavior.

```js
const authService = new AuthService({ userRepository });
const authController = new AuthController({ authService });
```

Constructor injection makes dependencies visible and allows collaborators to
be replaced with simple fakes where needed. See
[`src/container.js`](./src/container.js).

The dependencies are not interfaces; they are concrete objects that satisfy
the expected method shape at runtime. This is sometimes called duck typing.

### 5. Polymorphism: limited, not a class hierarchy

There is no subclass/override-based polymorphism. Some functions are
interchangeable by their callable contract—for example, Express middleware
functions and injected repository-like objects—but this is
function-based substitution, not an inheritance hierarchy or compiler-enforced
interface.

### 6. Inheritance: deliberately absent

The application classes do not use `extends` or `super`. The custom
[`ApiError`](./src/utils/ApiError.js) does extend JavaScript's built-in `Error`:

```js
class ApiError extends Error { /* ... */ }
```

That is the one clear inheritance example: it preserves standard Error
behavior while adding an HTTP status and optional validation details. It does
not imply that controllers/services/repositories inherit from one another.

### 7. Static schemas and factory-like model APIs

Mongoose schemas are definitions, and `mongoose.model(...)` compiles them into
model objects with query/create APIs. A model is not one database record.
Calling `User.create()` or hydrating query results produces individual
Mongoose documents. Details and lifetimes are in
[Object lifecycle](./OBJECT-LIFECYCLE.md).

## Why there is no `interface` or “main class”

The assignment asks for **plain JavaScript**, and this backend is CommonJS
JavaScript rather than TypeScript. JavaScript has no built-in `interface`
keyword. Contracts are expressed through method names and runtime behavior;
the repository/service constructors accept objects that provide the expected
methods.

There is also no single application “main class.” The entry point is
[`src/server.js`](./src/server.js), a module that loads the Express app and
starts the server. The object graph is assembled in `container.js`, not by a
`Main` class. This is idiomatic for a small Express application.

If stronger contracts become necessary, possible future choices include
TypeScript interfaces or JSDoc `@typedef`/`@implements` annotations and
contract tests. They are not present in the current project and should not be
described as existing features.

## Important design decisions to discuss

### Booking consistency

[`BookingService.create()`](./src/services/booking.service.js) runs the
eligibility check, seat reservation, and booking insert in one MongoDB
transaction. [`WorkshopRepository.reserveSeat()`](./src/repositories/workshop.repository.js)
uses a conditional atomic update (`bookedSeats < totalSeats`) so concurrent
requests cannot increment past capacity. The partial unique booking index in
[`booking.model.js`](./src/models/booking.model.js) permits only one active
booking for a user/workshop pair. Duplicate-key errors are translated to HTTP
409 conflicts.

Cancellation checks ownership and current status, marks the booking cancelled,
and releases one seat within a transaction. Workshop deletion also uses a
transaction and refuses to remove records with booking history. Transactions
require MongoDB to run as a replica set.

### Authentication and authorization

Registration and login inputs are validated with Joi. Passwords are hashed
with bcryptjs; a successful login receives a signed JWT with a one-hour expiry.
Authentication middleware verifies the token and loads the current user;
authorization middleware then checks the role. Public registration always
creates a regular user, even if a client submits a `role` field.

The `unique: true` User email schema option creates a database uniqueness
constraint when the index exists; the service also checks before insertion and
maps MongoDB duplicate-key errors to 409. The database index is essential for
the race between simultaneous registrations.

### Error handling

`asyncHandler()` forwards rejected async route/middleware promises to Express.
[`ApiError`](./src/utils/ApiError.js) carries an HTTP status and optional
details. `validate.middleware.js` reports Joi failures as 400; the final
[`error.middleware.js`](./src/middleware/error.middleware.js) serializes
application errors consistently. Unknown URLs go through the not-found
middleware.

## Required assignment stack and where it is used

The following technologies are listed in the developer-trial PDF. They are
mapped to the implementation rather than merely repeated from the requirement.

| Required stack | Where it is used |
| --- | --- |
| Node.js 18+ / plain JavaScript | Backend runtime and CommonJS source (`backend/package.json`, `backend/src/`). The project uses classes, `async`/`await`, and Express callbacks without TypeScript. |
| Express 4 | HTTP application, routers, middleware, and controllers (`src/app.js`, `src/routes/`, `src/middleware/`, `src/controllers/`). |
| MongoDB + Mongoose | Persistence connection (`src/config/database.js`), schemas/models (`src/models/`), repositories (`src/repositories/`), and transaction sessions in booking/workshop services. |
| Joi | Environment/config validation (`src/config/env.js`), request schemas (`src/validators/`), and shared request-validation middleware (`src/middleware/validate.middleware.js`). |
| JWT (`jsonwebtoken`) | Token signing on login (`src/services/auth.service.js`) and token verification (`src/middleware/authenticate.middleware.js`). |
| bcryptjs | Password hashing/comparison (`src/services/auth.service.js`) and seed-account password hashing (`scripts/seed.js`). |
| React 18 + Vite | Frontend application/runtime and development/build server (`frontend/package.json`, `frontend/src/main.jsx`, `frontend/vite.config.js`). |
| Redux Toolkit | Shared frontend authentication state (`frontend/src/app/store.js`, `frontend/src/features/auth/authSlice.js`). |
| Formik + Yup | Admin workshop form state and client-side validation (`frontend/src/features/workshops/components/WorkshopForm.jsx`). |
| MUI | Frontend UI components and theme (`frontend/src/features/`, `frontend/src/components/`, `frontend/src/app/theme.js`). |
| Axios | Shared frontend API client and authorization/401 interceptors (`frontend/src/services/api.js`; feature services under `frontend/src/features/`). |

Project dependency manifests are [`backend/package.json`](./package.json) and
[`frontend/package.json`](../frontend/package.json). The root setup/API guide
is [`../README.md`](../README.md).

## Interview questions to practice

1. **Why separate controllers, services, and repositories?**  
   To keep HTTP adaptation, application rules, and persistence queries from
   changing together. For example, a controller does not need to know how seat
   availability is enforced in MongoDB.
2. **Where is dependency injection?**  
   In `container.js`, which constructs objects and passes dependencies through
   constructors. Collaborators can be replaced with fakes where needed.
3. **Why no interfaces?**  
   The required backend language is plain JavaScript. Contracts are
   duck-typed; TypeScript/JSDoc contracts could be introduced if static
   checking is needed.
4. **How is overbooking prevented?**  
   Atomic conditional seat update + booking insert inside a transaction; a
   unique partial index also protects duplicate active bookings.
5. **Why is a transaction needed if the seat update is atomic?**  
   A seat counter update and booking insert are two writes. A transaction
   makes them commit or roll back together.
6. **Why retain cancelled bookings?**  
   They preserve booking history and auditability. The partial unique index
   excludes cancelled records, so the user may book again.
7. **What would you improve for a larger application?**  
   Add explicit JSDoc/TypeScript contracts, integration tests using a replica
   set, structured logging/metrics, and possibly separate domain ports from
   infrastructure. These are future improvements, not claims about the
   current implementation.
