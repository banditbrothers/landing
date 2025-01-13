export const isProduction = process.env.NODE_ENV === "production";

export const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export const hash = (s: string) =>
  s?.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

export const getTimestamp = () => Math.floor(Date.now() / 1000);
export const getDate = (timestamp: number) => new Date(timestamp * 1000);
