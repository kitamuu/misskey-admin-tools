import { client } from "../src/data-source";

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
  const userQuery: string = "SELECT id FROM public.user WHERE host is null";
  const followeeQuery: string = "SELECT \"followeeId\" FROM public.following";
  const selectQuery: string = "SELECT id, \"userId\" FROM public.drive_file WHERE \"createdAt\" < $1";
  const checkQuery: string = "SELECT id FROM public.user WHERE \"avatarId\" = $1 OR \"bannerId\" = $2";
  const deleteQuery: string = "DELETE FROM public.drive_file WHERE id = $1";
  
  await client.connect();

  // 自鯖のアカウント
  const userRes = await client.query(userQuery);
  const localUserIds: string[] = userRes.rows.map((row) => row.id);

  // 自鯖の人たちがフォローしているアカウント
  const followeeRes = await client.query(followeeQuery);
  const followeeIds: string[] = followeeRes.rows.map((row) => row.followeeId);

  const protectedUserIds: string[] = Array.from(new Set(localUserIds.concat(followeeIds)));

  const selectRes = await client.query(selectQuery, [formattedDate]);
  console.log(`Fetched ${selectRes.rowCount} records in ${new Date() - today}ms.`);

  let index: int = 0;
  for (const row of selectRes.rows) {
    index++;

    if (!protectedUserIds.includes(row.userId)) {
      // アイコンと背景画像は残す
      checkRes = await client.query(checkQuery, [row.id, row.id]);
      if (checkRes.rowCount == 0) {
        await client.query(deleteQuery, [row.id]);
        deleteCount++;
      }
    }

    if(index % delimiterNumForLog == 0){
      console.log(`${deleteCount} records deleted in ${(new Date() - today) / 1000}seconds. Still deleting...`);
    }
  }
  console.log(`Finished. ${deleteCount} records deleted in ${(new Date() - today) / 1000}seconds.`);

  await client.end();
})();
