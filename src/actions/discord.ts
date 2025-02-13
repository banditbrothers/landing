"use server";

import { isProduction } from "@/utils/misc";
import { MessageCreateOptions } from "discord.js";

// order channel
const ordersChannelId = "1331164962059587614";
const reviewsChannelId = "1339632586602971280";

export async function sendDiscordOrderMessage(data: MessageCreateOptions) {
  return sendDiscordMessage(ordersChannelId, data);
}

export async function sendDiscordReviewMessage(data: MessageCreateOptions) {
  return sendDiscordMessage(reviewsChannelId, data);
}

const sendDiscordMessage = async (channelId: string, data: MessageCreateOptions) => {
  if (!isProduction) {
    console.info("Skipping Discord message in non-production environment");
    return;
  }

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