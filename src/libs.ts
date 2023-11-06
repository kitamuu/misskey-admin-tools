const today: Date = new Date();
const targetDay: string = process.argv[2];
const priodDays: number = process.argv[3];
const TIME2000 = 946684800000;

export const toDate: string = (() => {
  if (targetDay) {
    if (targetDay.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) === null) {
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

export const genIdTime: string = (date: string) => {
  const t = Date.parse(date);
  return (t - TIME2000).toString(36).padStart(8, '0').slice(-8);
};

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

