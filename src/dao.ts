import { client } from "./data-source";

export class Dao {
  constructor(){}
  
  public async connect(): Promise<void> {
    await client.connect();
  }

  public async close(): Promise<void> {
    await client.end();
  }

  public async protectedUserIds(): Promise<string[]> {
    const userQuery: string = "SELECT id FROM public.user WHERE host is null";
    const followeeQuery: string = "SELECT \"followeeId\" FROM public.following";

    // 自鯖のアカウント
    const userRes = await client.query(userQuery);
    const localUserIds: string[] = userRes.rows.map((row) => row.id);

    // 自鯖の人たちがフォローしているアカウント
    const followeeRes = await client.query(followeeQuery);
    const followeeIds: string[] = followeeRes.rows.map((row) => row.followeeId);

    return Array.from(new Set(localUserIds.concat(followeeIds)));
  }

  public async isNotAvatarOrBanner(driveFileId: string): Promise<boolean> {
    const checkQuery: string = "SELECT id FROM public.user WHERE \"avatarId\" = $1 OR \"bannerId\" = $2";
    const checkRes = await client.query(checkQuery, [driveFileId, driveFileId]);

    return (checkRes.rowCount == 0)
  }

  public async driveFiles(toDate: string): Promise<{}[]> {
    const selectQuery: string = "SELECT id, \"userId\" FROM public.drive_file WHERE \"createdAt\" < $1";
    const selectRes = await client.query(selectQuery, [toDate]);

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

  public async notes(toDate: string, fromDate: string): Promise<{}[]> {
    const selectQuery: string = "SELECT id, \"replyId\", \"renoteId\", \"userId\", \"mentions\" FROM public.note WHERE \"createdAt\" < $1 AND \"createdAt\" > $2 ORDER BY \"createdAt\" DESC";
    const selectRes = await client.query(selectQuery, [toDate, fromDate]);

    return selectRes.rows;
  }

  public async deleteNote(id: string): Promise<void> {
    await client.query("DELETE FROM public.note WHERE id = $1", [id]);
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
