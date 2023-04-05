import { Dao } from "../src/dao";

const dao: Dao = new Dao();
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
  await dao.connect();
  const deleteCount: int = await dao.deleteNotes(formattedDate);
  console.log(`Delete ${deleteCount} notes in ${new Date() - today}ms.`);
  await dao.close();
})();
