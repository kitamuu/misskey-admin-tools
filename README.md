# Misskeyお一人様鯖のためのツール

※実行は自己責任で

## Dependencies:

misskey v13が動いている環境であれば大丈夫なはず

## Setup:

1. misskeyから`.config/default.yml`を当リポジトリの`.config/`内にコピー
2. Run `pnpm install --frozen-lockfile`

## Functions:

- アップデートツール([ここ](https://misskey-hub.net/docs/install/ubuntu-manual.html)に書いてある手順で環境構築した人用):

  - Run `sudo pnpx tsx scripts/update.ts 13.x.x`

- あまり使われてなさそうな(lastFetchedAtが一年以上前の)userのレコードを削除:

  - Run `pnpx tsx scripts/delete-unused-users.ts`

- (レコードが多い)chart系テーブルからリモートユーザのレコードを削除:

  - Run `pnpx tsx scripts/delete-remote-user-charts.ts`

- 指定年月日より過去の自鯖のアカウントとそれらがフォローしているアカウントのNote、
およびRenoteしたNoteとreply、mentionがあったNoteを残して消す:

  - Run `pnpx tsx scripts/delete-remote-notes.ts yyyy-MM-dd`

- 引数の指定がない場合は過去約3ヶ月分を残して消します、以下同様:

  - Run `pnpx tsx scripts/delete-remote-notes.ts`

- 指定年月日より過去のリモートユーザのアイコンと背景以外のdrive_fileのレコードを削除
（※リモートファイルのキャッシュを無効にしている前提なのでアップロードファイルの削除はしません）:

  - Run `pnpx tsx scripts/delete-remote-drivefiles.ts yyyy-MM-dd`
