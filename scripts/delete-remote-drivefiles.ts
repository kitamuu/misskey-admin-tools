import { Dao } from "../src/dao";

const dao: Dao = new Dao();
const today: Date = new Date();
const delimiterNumForLog: int = 10000;
let formattedDate: string;
let deleteCount: int = 0;

if(process.argv[2]) {
  if (process.argv[2].match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) === null) {
    process.exit(1);
  }
  formattedDate = process.argv[2];
}  else {
  const threeMonthsAgo: Date = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  formattedDate = threeMonthsAgo.toISOString().slice(0, 10);
}
console.log(`Will delete remote drive_file records before ${formattedDate}.`);

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const driveFiles: {}[] = await dao.driveFiles(formattedDate);
  console.log(`Fetched ${driveFiles.length} records in ${new Date() - today}ms.`);

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
      console.log(`${deleteCount} records deleted in ${(new Date() - today) / 1000}seconds. Still deleting...`);
    }
  }
  console.log(`Finished. ${deleteCount} records deleted in ${(new Date() - today) / 1000}seconds.`);

  await dao.close();
})();
