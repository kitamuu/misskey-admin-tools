import { load } from 'js-yaml';
import { readFileSync } from 'fs';

// バッチ実行時のカレントからの相対パス
export const config = load(readFileSync('.config/default.yml', 'utf8'));

