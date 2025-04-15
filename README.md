# Misskeyお一人様鯖のためのツール

※実行は自己責任で

## Dependencies:

- pnpm 10.10.0^
- misskey v2023.12.2^が動いている環境であれば大丈夫なはず
- configのID generationの設定が`aid`または`aidx`のものしか対応してません

## Setup:

1. [misskey](https://github.com/misskey-dev/misskey)から`.config/default.yml`を当リポジトリの`.config/`内にコピー
2. Run `pnpm install --frozen-lockfile` (何かしらのバージョンが古い人は`pnpm-lock.yaml`を消して`pnpm install`)

## Functions:

- アップデートツール([ここ](https://misskey-hub.net/docs/install/ubuntu-manual.html)に書いてある手順で環境構築した人用):

  - Run `sudo pnpx tsx scripts/update.ts 202y.M.n`

- あまり使われてなさそうな(lastFetchedAtが一年以上前の)userのレコードを削除:

  - Run `pnpx tsx scripts/delete-unused-users.ts`

- (レコードが多い)chart系テーブルからリモートユーザのレコードを削除:

  - Run `pnpx tsx scripts/delete-remote-user-charts.ts`

- ブロックしたサーバーのユーザーからの通知を削除:

  - Run `pnpx tsx scripts/delete-notifications-by-blocked-servers.ts`

- 指定年月日より過去n日分の投稿(Note)を消します。
(自鯖のアカウントのNoteとRenoteしたNote、Reply先のNote、mentionがあったNote、クリップ済みのNote、リアクションしたNote
および、自鯖のアカウントがフォローしているアカウントのNoteは残します)：

  - Run `pnpx tsx scripts/delete-remote-notes.ts yyyy-MM-dd n`

- 引数の指定がない場合は実行日の3ヶ月前から過去31日分を消します

  - Run `pnpx tsx scripts/delete-remote-notes.ts`

- 指定年月日より過去のリモートユーザのアイコンと背景以外のdrive_fileのレコードを削除
（※リモートファイルのキャッシュを無効にしている前提なのでアップロードファイルの削除はしません）:

  - Run `pnpx tsx scripts/delete-remote-drivefiles.ts yyyy-MM-dd`

- 引数の指定がない場合は実行日の3ヶ月前から過去分を消します

  - Run `pnpx tsx scripts/delete-remote-drivefiles.ts`

- ノートの検索（search_local.tsは自鯖のノートのみ対象）:

  - Run `pnpx tsx scripts/search.ts 検索したい言葉`
  - Run `pnpx tsx scripts/search_local.ts 検索したい言葉`

