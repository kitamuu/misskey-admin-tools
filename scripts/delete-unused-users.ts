import { Dao } from "../src/dao";
import { elapsedTime } from "../src/libs";

const dao: Dao = new Dao();

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  const deleteCount: int = await dao.deleteUnusedUsers();
  console.log(`${deleteCount} user records deleted in ${elapsedTime()}.`);

  await dao.close();
})();
