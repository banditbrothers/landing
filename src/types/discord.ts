export type DiscordEmbedField = {
  name: string;
  value: string;
};

export type DiscordEmbed = {
  title?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
};

export type DiscordMessage = {
  content?: string;
  embeds?: DiscordEmbed[];
};
