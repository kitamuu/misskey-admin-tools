import { load } from 'js-yaml';
import { readFileSync } from 'fs';
const { Client } = require('pg');

// バッチ実行時のカレントからの相対パス
const config = load(readFileSync('.config/default.yml', 'utf8'));

export const client = new Client({
  user: config.db.user,
  host: config.db.host,
  database: config.db.db,
  password: config.db.pass,
  port: config.db.port,
});
