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

## AI usage

I chose to challenge myself and write the frontend in React and TypeScript. I had no earlier experience with either (I experimented very minimally with React during the summer). AI was used in the frontend development as a research partner, mainly to help me understand the syntax and make progress in the coding. The threshold was fairly high because I started from the basics with React. All `.ts` files are written by me, and there AI only helped when I did not understand something.

In `/pages` I used `Claude Code v2.1.284 Opus 5.5` to generate a large part of the JSX code. I understand the generated code, and it was generated with the mindset that this is NOT a frontend course focused on React and TypeScript. The generated code is mainly boilerplate JSX and Tailwind styling. All code generated with the coding tool is watermarked with `----- Skriven av Claude Code Opus 5.5 -----` and `----- Slut på skriven av Claude Code Opus 5.5`.

Without this tool I would not have had time to build the project with this framework, because a large part of my time went into understanding the logic of React and TS (things like useState, useEffect and so on) and the TypeScript syntax itself.

## Personal reflection

I think the project went fairly well. The API part was not that hard; we went through all the concepts we needed thoroughly in class and it went quite smoothly. The hard part of the APIs was showing the right error messages and debugging. For example, at first I filtered the notes a user could see by `author_id`, which later turned out to be a mistake because users could then only see their own notes. I had to redesign the endpoints.

The frontend was quite demanding. I don't know whether it was a bit too ambitious to adopt a completely new framework and language (even though it is basically JS). A lot of time went into understanding the syntax and how to structure a React project, because everything was new. I would still say it was worth it, because React is very practical once you understand it and can use useState and let React handle the rendering, instead of manipulating innerHTML yourself.
