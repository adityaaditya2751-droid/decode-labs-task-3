// Pillar 2 (The Bridge): Integration & Connection
//
// Uses better-sqlite3, a native driver (not an ORM) so the raw
// SQL from schema.sql maps directly to what runs here. Swap this
// file out for a Postgres/Mongo connection and the routes above
// it don't need to change, as long as the same functions are exported.

const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data.sqlite3');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Apply schema on startup (idempotent thanks to IF NOT EXISTS)
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

module.exports = db;
