import { Dao } from "../src/dao";
import { redisClient } from "../src/cache-source";
import { elapsedTime } from "../src/libs";

const dao: Dao = new Dao();

(async () => {
  await dao.connect();

  const localUserIds: string[] = await dao.localUserIds();
  const blockedUserIds: string[] = await dao.blockedUserIds();

  for (const localUserId of localUserIds) {
    let deleteCount: int = 0;
    const notifications = await redisClient.xrange(`:notificationTimeline:${localUserId}`, '-', '+');

    for (const notification of notifications) {
      notifierId = JSON.parse(notification[1][1])["notifierId"]
      if (notifierId) {
        if (blockedUserIds.includes(notifierId)) {
          deleteCount += await redisClient.xdel(`:notificationTimeline:${localUserId}`, notification[0]);
        }
      }
    }
    console.log(`${localUserId}: ${deleteCount} notifications deleted.`);
  }

  console.log(`Finished in ${elapsedTime()}.`);

  await dao.close();
  await redisClient.quit();
})();

