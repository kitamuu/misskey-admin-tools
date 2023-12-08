import { Dao } from "../src/dao";
import { elapsedTime } from "../src/libs";

const dao: Dao = new Dao();
let deleteCount: int = 0;

(async () => {
  await dao.connect();

  const protectedUserIds: string[] = await dao.protectedUserIds();

  deleteCount = await dao.deleteChartPerUserDrive(protectedUserIds);
  console.log(`${deleteCount} __chart__per_user_drive records deleted in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartPerUserReaction(protectedUserIds);
  console.log(`${deleteCount} __chart__per_user_reaction records deleted in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartPerUserNotes(protectedUserIds);
  console.log(`${deleteCount} __chart__per_user_notes records deleted in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartDayPerUserDrive(protectedUserIds);
  console.log(`${deleteCount} __chart_day__per_user_drive records deleted in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartDayPerUserNotes(protectedUserIds);
  console.log(`${deleteCount} __chart_day__per_user_notes records deleted in ${elapsedTime()}.`);

  deleteCount = await dao.deleteChartDayPerUserReaction(protectedUserIds);
  console.log(`${deleteCount} __chart_day__per_user_reaction records deleted in ${elapsedTime()}.`);

  await dao.close();
})();
