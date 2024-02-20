import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import Redis from 'ioredis';

// バッチ実行時のカレントからの相対パス
const config = load(readFileSync('.config/default.yml', 'utf8'));

export const redisClient = new Redis({
  port: config.redis.port,
  host: config.redis.host,
  password: config.redis.pass,
  db: config.redis.db ?? 0,
  keyPrefix: config.redis.prefix ?? config.url.match(/^(?:https?:\/\/)?([^\/]+)/)[1],
});

