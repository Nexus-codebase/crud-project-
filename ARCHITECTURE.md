# Architecture

This document explains the backend flow and module responsibilities.

## High-Level Flow

```text
Client (Browser/Postman)
        |
        v
     main.js
        |
        v
      app.js
        |-----------------------------|
        v                             v
expressions.js                    animals.js
        |                             |
        |---------- uses -------------|
                      v
                    utils.js
```

## Module Responsibilities

## main.js

- Imports app from app.js
- Reads PORT from environment or defaults to 4001
- Starts the HTTP server

## app.js

- Creates Express application
- Serves static files from public
- Mounts resource routers:
  - /expressions -> expressions router
  - /animals -> animals router

## expressions.js

- Owns in-memory expressions array
- Seeds initial expressions via seedElements
- Implements CRUD handlers for /expressions

## animals.js

- Owns in-memory animals array
- Seeds initial animals via seedElements
- Implements CRUD handlers for /animals

## utils.js

Shared helper layer for both resources:
- getElementById(id, list)
- getIndexById(id, list)
- createElement(type, queryArguments)
- updateElement(id, queryArguments, list)
- seedElements(array, type)

Also stores in-memory ID counters:
- expressionIdCounter
- animalIdCounter

## Data Model

Each resource item has the same shape:

```json
{
  "id": 1,
  "emoji": "...",
  "name": "..."
}
```

## Request Handling Notes

- Create and update handlers read input from query string.
- Data persistence is in-memory only.
- Server restart resets all runtime-created data.

## Project Structure (Reference)

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
