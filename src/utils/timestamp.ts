export const SECONDS_PER_HOUR = 60 * 60;
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

export const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000);
export const getTimestamp = () => toTimestamp(new Date());
export const getDate = (timestamp: number) => new Date(timestamp * 1000);

export const formattedDateTimeLong = (timestamp: number) => {
  const date = getDate(timestamp);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    hour12: true,
    month: "short",
    year: "numeric",
  });
};
