import { client } from "./data-source";
import { genIdTime } from "./libs";

export class Dao {
  constructor(){}
  
  public async connect(): Promise<void> {
    await client.connect();
  }

  public async close(): Promise<void> {
    await client.end();
  }

  public async localUserIds(): Promise<string[]> {
    const userQuery: string = "SELECT id FROM public.user WHERE host is null";
    const userRes = await client.query(userQuery);

    return userRes.rows.map((row) => row.id);
  }

  public async protectedUserIds(): Promise<string[]> {
    const followeeQuery: string = "SELECT \"followeeId\" FROM public.following";

    // 自鯖のアカウント
    const localUserIds: string[] = await this.localUserIds();

    // 自鯖の人たちがフォローしているアカウント
    const followeeRes = await client.query(followeeQuery);
    const followeeIds: string[] = followeeRes.rows.map((row) => row.followeeId);

    return Array.from(new Set(localUserIds.concat(followeeIds)));
  }

  public async blockedUserIds(): Promise<string[]> {
    const query: string = "SELECT id FROM public.user WHERE host = any($1::varchar[])";
    const blockedHosts: string[] = await this.blockedHosts();
    const userRes = await client.query({ text: query, values: [blockedHosts] });
    return userRes.rows.map((row) => row.id);
  }

  public async blockedHosts(): Promise<string[]> {
    const res = await client.query("SELECT \"blockedHosts\" FROM public.meta");

    return res.rows[0].blockedHosts;
  }

  public async isNotAvatarOrBanner(driveFileId: string): Promise<boolean> {
    const checkQuery: string = "SELECT id FROM public.user WHERE \"avatarId\" = $1 OR \"bannerId\" = $2";
    const checkRes = await client.query(checkQuery, [driveFileId, driveFileId]);

    return (checkRes.rowCount == 0)
  }

  public async driveFiles(toDate: string): Promise<{}[]> {
    const selectQuery: string = "SELECT id, \"userId\" FROM public.drive_file WHERE \"id\" < $1";
    const selectRes = await client.query(selectQuery, [genIdTime(toDate)]);

    return selectRes.rows;
  }

  public async deleteDriveFile(id: string): Promise<void> {
    await client.query("DELETE FROM public.drive_file WHERE id = $1", [id]);
  }

  public async deleteUnusedUsers(): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.user WHERE NOT(id = any($1::varchar[])) AND \"lastFetchedAt\" < $2";
    const today: Date = new Date();
    const toDate: string = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toLocaleDateString('sv-SE');
    const protectedIds: string[] = await this.protectedUserIds();
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedIds, toDate] });
    return deleteRes.rowCount;
  }

  public async clippedNoteIds(): Promise<string[]> {
    const selectQuery: string = "SELECT \"noteId\" FROM public.clip_note";
    const selectRes = await client.query(selectQuery);

    return selectRes.rows.map((row) => row.noteId);
  }

  public async recentlyReactedNoteIds(toDate: string, fromDate: string): Promise<string[]> {
    const replyQuery: string = "SELECT \"replyId\" FROM public.note WHERE \"userId\" = any($1::varchar[]) AND \"id\" >= $2 AND \"replyId\" is not null";
    const renoteQuery: string = "SELECT \"renoteId\" FROM public.note WHERE \"userId\" = any($1::varchar[]) AND \"id\" >= $2 AND \"renoteId\" is not null";
    const reactionQuery: string = "SELECT \"noteId\" FROM public.note_reaction WHERE \"userId\" = any($1::varchar[]) AND \"id\" >= $2";

    const localUserIds: string[] = await this.localUserIds();

    // 削除対象期間内のNoteは別で取るので、ここでは対象期間より未来を取得対象とする
    const replyRes = await client.query({ text: replyQuery, values: [localUserIds, genIdTime(toDate)] });
    const relplyIds: string[] = replyRes.rows.map((row) => row.replyId);

    const renoteRes = await client.query({ text: renoteQuery, values: [localUserIds, genIdTime(toDate)] });
    const renoteIds: string[] = renoteRes.rows.map((row) => row.renoteId);

    // リアクションは削除期間の開始日よりも先の日付だけ抽出
    const reactionRes = await client.query({ text: reactionQuery, values: [localUserIds, genIdTime(fromDate)] });
    const reactionIds: string[] = reactionRes.rows.map((row) => row.noteId);

    return Array.from(new Set(relplyIds.concat(renoteIds, reactionIds)));
  }

  public async notes(toDate: string, fromDate: string): Promise<{}[]> {
    const selectQuery: string = "SELECT id, \"replyId\", \"renoteId\", \"userId\", \"mentions\" FROM public.note WHERE \"id\" < $1 AND \"id\" > $2 ORDER BY \"id\" DESC";
    const selectRes = await client.query(selectQuery, [genIdTime(toDate), genIdTime(fromDate)]);

    return selectRes.rows;
  }

  public async search(text: string, is_local?: boolean): Promise<{}[]> {
    const host_condition = is_local ? "AND \"user\".\"host\" is null" : "";
    const selectQuery: string = `SELECT note.id, \"note\".\"text\", \"user\".\"name\"
                                 FROM public.note INNER JOIN public.user ON \"user\".id = \"note\".\"userId\"
                                 WHERE \"note\".\"text\" LIKE '%' || $1 || '%' ${host_condition} ORDER BY \"note\".id DESC`;
    const selectRes = await client.query(selectQuery, [text]);

    return selectRes.rows;
  }

  public async deleteNote(id: string): Promise<void> {
    await client.query("DELETE FROM public.note WHERE id = $1", [id]);
  }

  public async batchDeleteNotes(ids: string[]): Promise<int> {
    const deleteRes = await client.query("DELETE FROM public.note WHERE id = any($1::varchar[])", [ids]);
    return deleteRes.rowCount;
  }

  public async deleteChartPerUserDrive(protectedUserIds: string[]): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.__chart__per_user_drive WHERE NOT(\"group\" = any($1::varchar[]))";
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedUserIds] });
    return deleteRes.rowCount;
  }

  public async deleteChartPerUserReaction(protectedUserIds: string[]): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.__chart__per_user_reaction WHERE NOT(\"group\" = any($1::varchar[]))";
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedUserIds] });
    return deleteRes.rowCount;
  }

  public async deleteChartPerUserNotes(protectedUserIds: string[]): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.__chart__per_user_notes WHERE NOT(\"group\" = any($1::varchar[]))";
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedUserIds] });
    return deleteRes.rowCount;
  }

  public async deleteChartDayPerUserDrive(protectedUserIds: string[]): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.__chart_day__per_user_drive WHERE NOT(\"group\" = any($1::varchar[]))";
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedUserIds] });
    return deleteRes.rowCount;
  }

  public async deleteChartDayPerUserNotes(protectedUserIds: string[]): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.__chart_day__per_user_notes WHERE NOT(\"group\" = any($1::varchar[]))";
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedUserIds] });
    return deleteRes.rowCount;
  }
  public async deleteChartDayPerUserReaction(protectedUserIds: string[]): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.__chart_day__per_user_reaction WHERE NOT(\"group\" = any($1::varchar[]))";
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedUserIds] });
    return deleteRes.rowCount;
  }
}

