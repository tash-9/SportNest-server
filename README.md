# SportNest Server

SportNest - Sports Facility Booking Management System (Server)

## Purpose
This server provides RESTful APIs for the SportNest client. It handles user authentication (via Better Auth), facility management, and booking operations. MongoDB is used as the database.

## Live URL
[Click here for Server URL](https://sportnest-server-black.vercel.app/)

## Features
- User authentication verification with Better Auth JWKS
- Facility CRUD operations:
  - Add, update, delete, and list facilities
- Booking operations:
  - Create, view, and cancel bookings
  - Only the owner can update or delete their facilities/bookings
- MongoDB database integration
- CORS configuration for secure client-server communication
- Private API routes protected by middleware

## NPM Packages Used
- `express`
- `cors`
- `dotenv`
- `mongodb`
- `jose-cjs`
- `nodemon` (dev dependency)

