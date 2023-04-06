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

export const elapsedTime = () => {
  return new Date() - today;
};

