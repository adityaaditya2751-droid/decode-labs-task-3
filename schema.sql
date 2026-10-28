-- Project 3: Database Integration
-- Pillar 1 (The Blueprint): Schema & Design
--
-- Two tables in a One-to-Many relationship:
--   One User  ->  Many Orders
--
-- Constraints enforce data integrity at the DATABASE level,
-- not just in application code (see slide "The Database is
-- the Final Source of Truth").

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,   -- Primary Key
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,                -- UNIQUE constraint
  age        INTEGER CHECK (age >= 0),             -- CHECK constraint
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,   -- Primary Key
  user_id    INTEGER NOT NULL,                    -- Foreign Key
  item       TEXT NOT NULL,
  total      REAL NOT NULL CHECK (total >= 0),     -- CHECK constraint
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
