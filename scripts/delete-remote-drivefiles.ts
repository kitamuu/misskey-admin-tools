import { Dao } from "../src/dao";
import { toDate } from "../src/arg-date";
import { elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
const delimiterNumForLog: int = 10000;
let deleteCount: int = 0;

console.log(`Will delete remote drive_file records before ${toDate}.`);

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const driveFiles: {}[] = await dao.driveFiles(toDate);
  console.log(`${driveFiles.length} records fetched in ${elapsedTime()}.`);

  let index: int = 0;
  for (const driveFile of driveFiles) {
    index++;

    if (!protectedUserIds.includes(driveFile.userId)) {
      // アイコンと背景画像は残す
      if (await dao.isNotAvatarOrBanner(driveFile.id)) {
        await dao.deleteDriveFile(driveFile.id);
        deleteCount++;
      }
    }

    if(index % delimiterNumForLog == 0){
      console.log(`${deleteCount} records deleted in ${elapsedTime()}. Still running...`);
    }
  }
  console.log(`Finished. ${deleteCount} records deleted in ${elapsedTime()}.`);

  await dao.close();
})();
