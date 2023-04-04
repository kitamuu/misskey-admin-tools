import { client } from "../src/data-source";

const today: Date = new Date();
let formattedDate: string;

if(process.argv[2]) {
  if (process.argv[2].match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) === null) {
    process.exit(1);
  }
  formattedDate = process.argv[2];
}  else {
  const threeMonthsAgo: Date = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  formattedDate = threeMonthsAgo.toISOString().slice(0, 10);
}
console.log(`Delete remote notes before ${formattedDate}.`);

(async () => {
  const userQuery: string = "SELECT id FROM public.user WHERE host is null";
  const followeeQuery: string = "SELECT \"followeeId\" FROM public.following";
  const deleteQuery: string = "DELETE FROM public.note WHERE NOT(\"userId\" = any($1::varchar[])) and \"createdAt\" < $2";
  
  await client.connect();

  // 自鯖のアカウント
  const userRes = await client.query(userQuery);
  const localUserIds: string[] = userRes.rows.map((row) => row.id);

  // 自鯖の人たちがフォローしているアカウント
  const followeeRes = await client.query(followeeQuery);
  const followeeIds: string[] = followeeRes.rows.map((row) => row.followeeId);

  const protectedIds: string[] = Array.from(new Set(localUserIds.concat(followeeIds)));

  const deleteRes = await client.query({ text: deleteQuery, values: [protectedIds, formattedDate] });
  const endTime: Date = new Date() - today;
  console.log(`Delete ${deleteRes.rowCount} notes in ${endTime}ms.`);

  await client.end();
})();
