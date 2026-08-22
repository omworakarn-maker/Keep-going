export const isoToday = () => new Date().toISOString().slice(0, 10);

export const formatThaiDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const daysSince = (date: string) => {
  const start = new Date(`${date}T00:00:00`);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
};

export const dateFromDaysAgo = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const elapsedSince = (startedAt: string, now = Date.now()) => {
  const totalSeconds = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};
