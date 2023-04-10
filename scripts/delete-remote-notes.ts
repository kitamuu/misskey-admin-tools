import { Dao } from "../src/dao";
import { formattedDate, elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
const delimiterNumForLog: int = 10000;
let deleteCount: int = 0;
let protectedNoteIds: string[] = [];

console.log(`Will delete remote notes before ${formattedDate}.`);

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const notes: {}[] = await dao.notes(formattedDate);
  console.log(`Fetched ${notes.length} notes in ${elapsedTime()}.`);

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
      // フォロー外でもRenoteとReplyされたNoteは残す
      if (protectedNoteIds.includes(note.id)) {
        protectedNoteIds = protectedNoteIds.filter(id => id !== note.id);
      // フォロー外でもmentionされたNoteは残す
      } else if (note.mentions.filter(id => protectedUserIds.includes(id)).length > 0) {
      } else {
        await dao.deleteNote(note.id);
        deleteCount++;
      }
    }

    if(deleteCount > 0 && deleteCount % delimiterNumForLog == 0){
      console.log(`${deleteCount} notes deleted in ${elapsedTime()}. Still deleting...`);
    }
  }
  console.log(`Finished. ${deleteCount} notes deleted in ${elapsedTime()}.`);

  await dao.close();
})();
