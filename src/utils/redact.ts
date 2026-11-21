// Keeps the first and last character of each part, so short values never throw ("a" stays "a")
const mask = (s: string) => (s.length <= 2 ? s : `${s[0]}${"*".repeat(s.length - 2)}${s[s.length - 1]}`);

export const redactEmail = (email: string): string => {
  const [username = "", domain = ""] = email.split("@");
  return `${mask(username)}@${mask(domain)}`;
};

export const redactName = (name: string): string => name.trim().split(/\s+/).map(mask).join(" ");

export const redactPhone = (phone: string): string =>
  phone.length <= 4 ? phone : `${phone.slice(0, 1)}${"*".repeat(phone.length - 4)}${phone.slice(-3)}`;
