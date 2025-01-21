"use server";

import { isProduction } from "@/utils/misc";
import { Client, GatewayIntentBits, MessageCreateOptions } from "discord.js";

// order channel
const channelId = "1331164962059587614";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`Discord: Logged in as ${client.user?.tag}`);
});

export async function sendDiscordOrderMessage(data: MessageCreateOptions) {
  if (!isProduction) return;

  await client.login(process.env.DISCORD_TOKEN);

  try {
    const channel = await client.channels.fetch(channelId);
    if (channel && channel.isSendable()) {
      await channel.send(data);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
