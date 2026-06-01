# SportNest Server
SportNest Server is the backend API for the SportNest sports facility booking management system. It handles facility data, booking data, protected owner actions, and JWT-based API authorization for the client application.

## Purpose
The purpose of this server is to provide REST API support for a sports facility booking platform where users can browse facilities, create bookings, manage their own facilities, and cancel their own bookings. Facility and booking information is stored in MongoDB.

## Live URL
Client Live URL Live URL: https://sportnest-server-black.vercel.app/

Expected output
```bash
SportNest server is running
```

## Features
- Express.js REST API server
- MongoDB database connection using the official MongoDB driver
- CORS configuration for local and deployed client URLs
- Facility CRUD operations: add, update, delete, and list facilities
- Booking operations: create, view, and cancel bookings
- Featured facilities API with six facility limit
- Search facilities by name, facility type, or location
- Filter facilities by sport category
- Add facility with authenticated owner email
- View logged-in user's own facilities and bookings
- Owner-protected facility update and delete
- Owner-protected booking cancel/delete
- Private API routes protected by middleware
- User authentication verification with Better Auth JWKS
- Seed route for inserting sample facility data

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Better Auth JWT/JWKS
- CORS
- dotenv
- jose-cjs
- Nodemon


## NPM Packages Used
- `express`
- `bcryptjs`
- `better-auth`
- `cors`
- `dotenv`
- `mongodb`
- `mongoose`
- `jose-cjs`
- `jsonwebtoken`
- `nodemon` (dev dependency)

## Developed by
Tasfia Islam Raisha
