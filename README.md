# Workshop Booking App

A React and Express application for workshop discovery and booking. Users can register, sign in, book one seat per workshop, review bookings, and cancel them. Admins can create, edit, and delete upcoming workshops; admins cannot book workshops.

Backend design documentation:

- [Backend architecture and OOP concepts](./backend/README.md)
- [Backend object lifecycle and request flows](./backend/OBJECT-LIFECYCLE.md)

## Requirements

- Node.js 18+
- npm
- MongoDB configured as a replica set (MongoDB Atlas works)

## Setup

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env`:

- Set `MONGODB_URI` to your MongoDB replica-set or Atlas connection string.
- Replace `JWT_SECRET` with a random value of at least 32 characters.
- Set unique seed emails and passwords. Seed passwords must be 8–128 characters.
- Set `CLIENT_URL` to your frontend origin if it differs from `http://localhost:5173`.

Seed the accounts and sample workshops, then start the server:

```powershell
npm run seed
npm run dev
```

The seed command creates or updates the admin and two user accounts, plus three future workshops. Login details are the values of `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, `SEED_USER_ONE_EMAIL`/`SEED_USER_ONE_PASSWORD`, and `SEED_USER_TWO_EMAIL`/`SEED_USER_TWO_PASSWORD` in your local `backend/.env`. Change the example values before seeding. Never commit `.env`.

### Frontend

In a separate terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`; the API defaults to `http://localhost:5000`. Set `VITE_API_URL` in `frontend/.env` when the backend uses another URL.

## Features

- Login and registration with server-side validation, JWT persistence, and session restoration.
- Protected routes for authenticated users and admins.
- Paginated upcoming workshops with seats remaining.
- Users see **Booked** for their active reservation and **Full** when no seats remain. Booking actions are disabled while a request is in progress.
- Users can review bookings and cancel an active booking.
- Admins can create, edit, and delete upcoming workshops from `/admin`. Admins cannot create bookings.
- Workshop deletion is refused if any booking history exists; reducing total seats below the number already booked is also refused.
- Joi validation, centralized API errors, role authorization, and authenticated profile/list endpoints.
- React 18 with Formik and Yup validation for admin workshop forms.

## API

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a regular user |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Restore the current user profile |
| GET | `/api/workshops?page=1&limit=10` | Authenticated | List future workshops with `seatsLeft` and pagination |
| POST | `/api/workshops` | Admin | Create a workshop |
| PATCH | `/api/workshops/:workshopId` | Admin | Update a workshop |
| DELETE | `/api/workshops/:workshopId` | Admin | Delete a workshop with no booking history |
| POST | `/api/workshops/:workshopId/book` | User | Book a seat |
| GET | `/api/bookings/me` | User | List bookings with workshop details |
| POST | `/api/bookings/:bookingId/cancel` | User, owner | Cancel a booking |

The backend retains `/api/bookings` (POST), `/api/bookings/mine` (GET), and PATCH cancellation aliases for compatibility.

## Overbooking protection

Booking creation runs in a MongoDB transaction. The seat reservation uses a conditional atomic update that succeeds only while `bookedSeats < totalSeats`; the booking record is created in the same transaction. A partial unique index prevents duplicate active bookings for a user/workshop pair. Cancellation updates booking status and releases one seat in a transaction. MongoDB transactions require a replica set, including for local development.

## Local checks

```powershell
cd frontend
npm run lint
npm run build
```

## Project stages

The project is organized in incremental commits:

1. Project structure and setup
2. Database configuration, models, and repositories
3. Backend middleware, validation, and API
4. Frontend application
5. Setup and architecture documentation

## Remaining work

- The optional admin view showing the identities of workshop attendees is not implemented.
- No hosted demo is deployed.
- UI/browser and database integration require a configured local MongoDB/Atlas instance and the seeded accounts.
