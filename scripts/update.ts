const execSync = require('child_process').execSync;
let message: sgring;

if (process.argv[2].match(/^([0-9]+\.)[0-9]+(\.[0-9]+)$/) === null) {
  process.exit(1);
}

message = execSync('systemctl stop misskey').toString();
console.log("stop misskey");

message = execSync('sudo -u misskey git -C ~misskey/misskey fetch').toString();
console.log(message);

message = execSync(`sudo -u misskey git -C ~misskey/misskey checkout ${process.argv[2]}`).toString();
console.log(message);

message = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; NODE_ENV=production pnpm install --frozen-lockfile"').toString();
console.log(message);

message = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; pnpm run clean"').toString();
console.log(message);

message = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; pnpm store prune"').toString();
console.log(message);

message = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; NODE_ENV=production NODE_OPTIONS=--max_old_space_size=2048 pnpm run build"').toString();
console.log(message);

message = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; pnpm run migrate"').toString();
console.log(message);

message = execSync('systemctl start misskey').toString();
console.log("start misskey");
