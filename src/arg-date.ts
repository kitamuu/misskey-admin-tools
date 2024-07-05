const today: Date = new Date();
const targetDay: string = process.argv[2];
const priodDays: number = process.argv[3];

export const toDate: string = (() => {
  if (targetDay) {
    if (targetDay.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) === null) {
      console.log(`bad argument`);
      process.exit(1);
    }
    return targetDay;
  } else {
    return new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toLocaleDateString('sv-SE');
  }
})();

export const fromDate: string = (() => {
  const _toDate: Date = new Date(toDate);
  if (priodDays) {
    return new Date(_toDate.getFullYear(), _toDate.getMonth(), _toDate.getDate() - priodDays).toLocaleDateString('sv-SE');
  } else {
    return new Date(_toDate.getFullYear(), _toDate.getMonth(), _toDate.getDate() - 31).toLocaleDateString('sv-SE');
  }
})();

