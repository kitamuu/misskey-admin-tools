import { Dao } from "../src/dao";
import { elapsedTime, parseId } from "../src/libs";
import { config } from "../src/config";

const dao: Dao = new Dao();
const text: string = process.argv[2];

if (!text) {
  console.log(`specify search a word`);
  process.exit(1);
}
console.log(`Search for \"${text}\" in all notes.`);

(async () => {
  await dao.connect();

  const notes: {}[] = await dao.search(text);
  console.log(`${notes.length} notes fetched in ${elapsedTime()}.`);

  let index: int = 0;
  for (const note of notes) {
    index++;
    console.log(``);
    console.log(`[${index}]`);
    console.log(`date | ${parseId(note.id)}`);
    console.log(`name | ${note.name}`);
    console.log(`note | ${note.text}`);
    console.log(`url  | ${config.url}notes/${note.id}`);
  }

  await dao.close();
})();
