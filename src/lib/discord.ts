"use server";

// import { isProduction } from "@/utils/misc";
import { MessageCreateOptions } from "discord.js";

// order channel
const channelId = "1331164962059587614";

export async function sendDiscordOrderMessage(data: MessageCreateOptions) {
  // if (!isProduction) return;

  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Discord API error:", errorData);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
