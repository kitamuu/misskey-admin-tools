const today: Date = new Date();
const targetDay: string = process.argv[2];

export const formattedDate: string = (() => {
  if (targetDay) {
    if (targetDay.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) === null) {
      process.exit(1);
    }
    return targetDay;
  } else {
    const threeMonthsAgo: Date = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    return threeMonthsAgo.toISOString().slice(0, 10);
  }
})();

export const elapsedTime: string = () => {
  const ms = new Date() - today;
  const tsec = Math.floor(ms / 1000);
  const min = Math.floor(tsec / 60);
  const sec = tsec % 60;
  if (tsec == 0) {
    return `${ms}ms`;
  } else {
    return `${min} min ${sec} sec`;
  }
};
