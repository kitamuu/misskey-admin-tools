import { Dao } from "../src/dao";
import { toDate, fromDate } from "../src/arg-date";
import { elapsedTime } from "../src/libs";
const lodash = require('lodash');

const dao: Dao = new Dao();
const delimiterNumForLog: int = 10;
const batchCount: int = 1000;
let deleteCount: int = 0;

console.log(`Will delete remote notes in ${fromDate} ~ ${toDate}.`);
(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  // クリップされたNoteは残す
  let protectedNoteIds: string[] = await dao.clippedNoteIds();
  // 削除指定期間より未来からのReplyとRenoteおよび、自鯖民がリアクションしたNoteを保護
  protectedNoteIds = Array.from(new Set(protectedNoteIds.concat(await dao.recentlyReactedNoteIds(toDate, fromDate))));

  const notes: {}[] = await dao.notes(toDate, fromDate);
  console.log(`${notes.length} notes fetched in ${elapsedTime()}.`);

  const deleteNoteIds: string[] = [];

  for (const note of notes) {
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
        deleteNoteIds.push(note.id)
      }
    }
  }
  console.log(`will delete ${deleteNoteIds.length} notes.`);

  const chunkedDeleteNoteIds = lodash.chunk(deleteNoteIds, batchCount);
  let index: int = 0;

  for (const devidedDeleteNoteIds of chunkedDeleteNoteIds) {
    index++;
    deleteCount += await dao.batchDeleteNotes(devidedDeleteNoteIds);
    if(index % delimiterNumForLog == 0) {
      console.log(`${deleteCount} notes deleted in ${elapsedTime()}. Still running...`);
    }
  }
  console.log(`Finished. ${deleteCount} notes deleted in ${elapsedTime()}.`);

  await dao.close();
})();
