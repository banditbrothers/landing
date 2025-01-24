export const getTimestamp = () => Math.floor(Date.now() / 1000);
export const getDate = (timestamp: number) => new Date(timestamp * 1000);

export const formattedDateTime = (timestamp: number) => {
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
