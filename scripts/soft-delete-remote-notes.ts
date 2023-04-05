import { Dao } from "../src/dao";

const dao: Dao = new Dao();
const today: Date = new Date();
const delimiterNumForLog: int = 100000;
let formattedDate: string;
let deleteCount: int = 0;
let protectedNoteIds: string[] = [];

if(process.argv[2]) {
  if (process.argv[2].match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) === null) {
    process.exit(1);
  }
  formattedDate = process.argv[2];
}  else {
  const threeMonthsAgo: Date = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  formattedDate = threeMonthsAgo.toISOString().slice(0, 10);
}
console.log(`Will delete remote notes before ${formattedDate}.`);

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const notes: {}[] = await dao.notes(formattedDate);
  console.log(`Fetched ${notes.length} notes in ${new Date() - today}ms.`);

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
      console.log(`${deleteCount} notes deleted in ${(new Date() - today) / 1000}seconds. Still deleting...`);
    }
  }
  console.log(`Finished. ${deleteCount} notes deleted in ${(new Date() - today) / 1000}seconds.`);

  await dao.close();
})();
