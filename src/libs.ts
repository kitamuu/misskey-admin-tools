const today: Date = new Date();
const TIME2000 = 946684800000 + (9 * 60 * 60 * 1000); // JST

export const genIdTime: string = (date: string) => {
  const t = Date.parse(date);
  return (t - TIME2000).toString(36).padStart(8, '0').slice(-8);
};

export const parseId: Date = (id: string) => {
  const time = parseInt(id.slice(0, 8), 36) + TIME2000;
  const date = new Date(time);
  return date.toLocaleDateString('sv-SE') + ' ' + date.toLocaleTimeString('ja-JP', { hour12:false });
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

