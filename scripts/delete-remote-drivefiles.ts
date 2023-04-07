import { Dao } from "../src/dao";
import { formattedDate, elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
const delimiterNumForLog: int = 10000;
let deleteCount: int = 0;

console.log(`Will delete remote drive_file records before ${formattedDate}.`);

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const driveFiles: {}[] = await dao.driveFiles(formattedDate);
  console.log(`Fetched ${driveFiles.length} records in ${elapsedTime()}.`);

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
      console.log(`${deleteCount} records deleted in ${elapsedTime()}. Still deleting...`);
    }
  }
  console.log(`Finished. ${deleteCount} records deleted in ${elapsedTime()}.`);

  await dao.close();
})();
