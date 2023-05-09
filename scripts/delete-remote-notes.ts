import { Dao } from "../src/dao";
import { toDate, fromDate, elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
const delimiterNumForLog: int = 10000;
let deleteCount: int = 0;

console.log(`Will delete remote notes in ${fromDate} ~ ${toDate}.`);
(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();
  let protectedNoteIds: string[] = await dao.clippedNoteIds(); // クリップされたNoteは残す

  const notes: {}[] = await dao.notes(toDate, fromDate);
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
        // nop
      } else {
        await dao.deleteNote(note.id);
        deleteCount++;

        if(deleteCount % delimiterNumForLog == 0) {
          console.log(`${deleteCount} notes deleted in ${elapsedTime()}. Still deleting...`);
        }
      }
    }
  }
  console.log(`Finished. ${deleteCount} notes deleted in ${elapsedTime()}.`);

  await dao.close();
})();
