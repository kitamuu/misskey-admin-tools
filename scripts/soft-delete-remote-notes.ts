import { Dao } from "../src/dao";
import { formattedDate, elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
const delimiterNumForLog: int = 100000;
let deleteCount: int = 0;
let protectedNoteIds: string[] = [];

console.log(`Will delete remote notes before ${formattedDate}.`);

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const notes: {}[] = await dao.notes(formattedDate);
  console.log(`Fetched ${notes.length} notes in ${elapsedTime()}ms.`);

  let index: int = 0;
  for (const note of notes) {
    index++;

    if (protectedUserIds.includes(note.userId)) {
      if (note.replyId) {
        protectedNoteIds.push(note.replyId);
      }
      if (note.renoteId) {
        protectedNoteIds.push(note.renoteId);
      }
      if (protectedNoteIds.includes(note.id)) {
        protectedNoteIds = protectedNoteIds.filter(id => id !== note.id);
      }
    } else {
      // フォロー外でもReplyとRenoteしたNoteは残す
      if (protectedNoteIds.includes(note.id)) {
        protectedNoteIds = protectedNoteIds.filter(id => id !== note.id);
      } else {
        await dao.deleteNote(note.id);
        deleteCount++;
      }
    }

    if(index % delimiterNumForLog == 0){
      console.log(`${deleteCount} notes deleted in ${elapsedTime() / 1000}seconds. Still deleting...`);
    }
  }
  console.log(`Finished. ${deleteCount} notes deleted in ${elapsedTime() / 1000}seconds.`);

  await dao.close();
})();
