# Project 3: Database Integration

DecodeLabs Full Stack Development — Industrial Training Kit, Batch 2026.

Connects a backend to a database and exposes CRUD operations over a
RESTful API, following the four pillars from the brief:

| Pillar | Covered by |
|---|---|
| 1. The Blueprint (Schema & Design) | `schema.sql` |
| 2. The Bridge (Integration & Connection) | `db.js` |
| 3. The Action (CRUD & RESTful HTTP) | `routes/users.js`, `routes/orders.js` |
| 4. The Shield (Integrity & Security) | constraints in `schema.sql` + parameterized queries everywhere |

## Stack

- **Node.js + Express** — HTTP layer
- **SQLite** via `better-sqlite3` (a native driver, not an ORM) — zero
  external setup, file-based database that behaves like any SQL engine
- No frontend included; test with `curl`, Postman, or Thunder Client

## Schema

Two tables in a **one-to-many** relationship (`User -> Orders`), matching
the "Structuring Data Through Relational Geometry" example in the deck:

```
users                       orders
------------------          ------------------
id     PK                   id         PK
name   NOT NULL             user_id    FK -> users.id
email  UNIQUE, NOT NULL     item       NOT NULL
age    CHECK (age >= 0)     total      CHECK (total >= 0)
created_at                  created_at
```

`ON DELETE CASCADE` on the foreign key means deleting a user deletes
their orders automatically — the database enforces this, not the app.

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`. The SQLite file (`data.sqlite3`)
and its tables are created automatically on first run.

## API Reference

### Users

| Method | Path | Description |
|---|---|---|
| POST | `/api/users` | Create a user `{ name, email, age }` |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get one user |
| GET | `/api/users/:id/orders` | Get a user with their orders |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user (cascades to orders) |

### Orders

| Method | Path | Description |
|---|---|---|
| POST | `/api/orders` | Create an order `{ user_id, item, total }` |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get one order |
| PUT | `/api/orders/:id` | Update an order |
| DELETE | `/api/orders/:id` | Delete an order |

## Example requests

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@email.com","age":28}'

# Create an order for that user (id 1)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"item":"Keyboard","total":42.00}'

# Get the user with their orders
curl http://localhost:3000/api/users/1/orders
```

## Security notes (Pillar 4)

- Every query uses **parameterized statements** (`?` placeholders via
  `better-sqlite3`'s `.prepare().run()/.get()/.all()`), so user input is
  always treated as data, never as executable SQL — this is what
  neutralizes SQL injection.
- `UNIQUE`, `NOT NULL`, and `CHECK` constraints live in the schema
  itself, so invalid or duplicate data is rejected by the database even
  if application logic has a bug.
