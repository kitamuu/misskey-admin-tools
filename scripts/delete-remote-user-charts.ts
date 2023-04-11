import { Dao } from "../src/dao";
import { elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
let deleteCount: int = 0;

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  deleteCount = await dao.deleteChartPerUserDrive(protectedUserIds);
  console.log(`delete ${deleteCount} __chart__per_user_drive records in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartPerUserReaction(protectedUserIds);
  console.log(`delete ${deleteCount} __chart__per_user_reaction records in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartPerUserNotes(protectedUserIds);
  console.log(`delete ${deleteCount} __chart__per_user_notes records in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartDayPerUserDrive(protectedUserIds);
  console.log(`delete ${deleteCount} __chart_day__per_user_drive records in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartDayPerUserNotes(protectedUserIds);
  console.log(`delete ${deleteCount} __chart_day__per_user_notes records in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartDayPerUserReaction(protectedUserIds);
  console.log(`delete ${deleteCount} __chart_day__per_user_reaction records in ${elapsedTime()}.`);

  await dao.close();
})();
