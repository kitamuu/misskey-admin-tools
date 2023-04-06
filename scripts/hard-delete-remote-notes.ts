import { Dao } from "../src/dao";
import { formattedDate, elapsedTime } from "../src/libs";

const dao: Dao = new Dao();

console.log(`Delete remote notes before ${formattedDate}.`);

(async () => {
  await dao.connect();
  const deleteCount: int = await dao.deleteNotes(formattedDate);
  console.log(`Delete ${deleteCount} notes in ${elapsedTime()}ms.`);
  await dao.close();
})();
