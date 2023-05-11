const execSync = require('child_process').execSync;
let massage: sgring;

if (process.argv[2].match(/^([0-9]+\.)[0-9]+(\.[0-9]+)$/) === null) {
  process.exit(1);
}

massage = execSync('systemctl stop misskey').toString();
console.log("stop misskey");

massage = execSync('sudo -u misskey git -C ~misskey/misskey fetch').toString();
console.log(massage);

massage = execSync(`sudo -u misskey git -C ~misskey/misskey checkout ${process.argv[2]}`).toString();
console.log(massage);

massage = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; NODE_ENV=production pnpm install --frozen-lockfile"').toString();
console.log(massage);

massage = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; pnpm run clean"').toString();
console.log(massage);

massage = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; NODE_ENV=production NODE_OPTIONS=--max_old_space_size=2048 pnpm run build"').toString();
console.log(massage);

massage = execSync('sudo -u misskey sh -c "cd ~misskey/misskey; pnpm run migrate"').toString();
console.log(massage);

massage = execSync('systemctl start misskey').toString();
console.log("start misskey");
