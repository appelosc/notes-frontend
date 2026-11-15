# Notes Board App – Frontend

## Overview

This is a virtual whiteboard built in React where users can collaborate and plan their projects by creating notes (sticky notes). It can be used for project planning or brainstorming.
The project uses two databases and two external APIs.

This is one of three parts of the Notes Board App:

- [authn-authz](https://github.com/appelosc/authn-authz): authentication API that issues the JWTs
- [REST-api-notes](https://github.com/appelosc/REST-api-notes): boards and notes API
- **notes-frontend** (this repo): React and TypeScript frontend, styled with Tailwind CSS

## Getting started

Create a `.env` file in the project root with the base URLs of the two APIs:

```env
VITE_AUTH_API_URL=http://localhost:3001
VITE_NOTES_API_URL=http://localhost:3002
```

Then install and run:

```bash
npm install
npm run dev
```

## Architecture

The project uses two external APIs. One is an authentication API with the endpoints `/auth/login` and `/auth/register`, used to register new users and log them in. A logged-in user gets a signed JWT, which is sent with every request to authorize requests to the Notes API.

The Notes API keeps track of boards and notes and serves content to the frontend. It verifies the stored JWT in every request through an `Authorization` header. Middleware in the Notes API uses the token to authorize each request before it runs. The middleware checks whether the user has access to a given board and then returns the notes that belong to it. PUT, PATCH and DELETE are called as `/notes/boardId/noteId`. POST is called with only `/notes`. GET is called as `/notes/boardId`.

The flow is: Frontend -> Auth API for a JWT, then Frontend -> Notes API with the token.

`src/api` contains all API calls. `client.ts` holds a general fetch function, and the file exports two general fetch calls with the base path to each API.

These two are used in `boards.ts`, `notes.ts` and `users.ts` to define functions that call their endpoints.

`src/pages` contains all pages the user can see, such as the login page, the board page and the note page.

`src/types` contains interfaces for the objects the APIs return.

## Deployment

Both APIs are deployed on CSC Rahti and run in Docker. Secrets such as the JWT secret and the database URL are defined in the deployments on CSC Rahti. The frontend is deployed on `people.arcada.fi`.
