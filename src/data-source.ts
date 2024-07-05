import { config } from "./config";
const { Client } = require('pg');

export const client = new Client({
  user: config.db.user,
  host: config.db.host,
  database: config.db.db,
  password: config.db.pass,
  port: config.db.port,
});

