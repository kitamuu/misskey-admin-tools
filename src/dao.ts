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

  public async driveFiles(uptoDate: string): Promise<{}[]> {
    const selectQuery: string = "SELECT id, \"userId\" FROM public.drive_file WHERE \"createdAt\" < $1";
    const selectRes = await client.query(selectQuery, [uptoDate]);

    return selectRes.rows;
  }

  public async deleteDriveFile(id: string): Promise<void> {
    await client.query("DELETE FROM public.drive_file WHERE id = $1", [id]);
  }

  public async notes(uptoDate: string): Promise<{}[]> {
    const selectQuery: string = "SELECT id, \"replyId\", \"renoteId\", \"userId\" FROM public.note WHERE \"createdAt\" < $1 ORDER BY \"createdAt\" DESC";
    const selectRes = await client.query(selectQuery, [uptoDate]);

    return selectRes.rows;
  }

  public async deleteNotes(uptoDate: string): Promise<int> {
    const deleteQuery: string = "DELETE FROM public.note WHERE NOT(\"userId\" = any($1::varchar[])) and \"createdAt\" < $2";
    const protectedIds: string[] = await this.protectedUserIds();
    const deleteRes = await client.query({ text: deleteQuery, values: [protectedIds, uptoDate] });
    return deleteRes.rowCount;
  }

  public async deleteNote(id: string): Promise<void> {
    await client.query("DELETE FROM public.note WHERE id = $1", [id]);
  }
}
