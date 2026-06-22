# CRUD Operations API

A simple Express.js CRUD project with two in-memory resources:
- expressions
- animals

The app also serves a static frontend from the public folder.

## Tech Stack

- Node.js (CommonJS)
- Express 5

## Features

- Full CRUD routes for expressions
- Full CRUD routes for animals
- Static file hosting from public
- Seed data loaded at startup
- Utility helpers for ID lookup, creation, update, and seeding

## Project Structure

```text
CRUD operations/
|-- app.js
|-- main.js
|-- utils.js
|-- expressions.js
|-- animals.js
|-- test.js
|-- package.json
`-- public/
    |-- index.html
    |-- machines.js
    |-- css/
    |   |-- reset.css
    |   `-- style.css
    `-- js/
        `-- jquery-3.2.1.min.js
```

## How It Runs

- main.js starts the server and listens on PORT (default 4001)
- app.js creates the Express app, serves static assets, and mounts routers
- expressions.js handles /expressions routes
- animals.js handles /animals routes
- utils.js contains reusable CRUD helpers and ID counters

## Install and Start

```bash
npm install
node main.js
```

Server URL:

```text
http://localhost:4001
```

## API Endpoints

### Expressions

- GET /expressions
- GET /expressions/:id
- POST /expressions?emoji=<emoji>&name=<name>
- PUT /expressions/:id?emoji=<emoji>&name=<name>
- DELETE /expressions/:id

### Animals

- GET /animals
- GET /animals/:id
- POST /animals?emoji=<emoji>&name=<name>
- PUT /animals/:id?emoji=<emoji>&name=<name>
- DELETE /animals/:id

Note: This project reads create/update values from query parameters.

## Example Requests

Create an expression:

```text
POST http://localhost:4001/expressions?emoji=%F0%9F%98%84&name=smile
```

Update an animal:

```text
PUT http://localhost:4001/animals/1?emoji=%F0%9F%90%AF&name=Tiger
```

## Testing

Run tests directly:

```bash
node test.js
```

The current package.json test script is still the default placeholder.

## Notes

- Data is in-memory only and resets when the server restarts.
- IDs are incremented with counters in utils.js.
