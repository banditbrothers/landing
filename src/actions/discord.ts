"use server";

import "server-only"
import { isProduction } from "@/utils/misc";
import type { DiscordMessage } from "@/types/discord";

// order channel
const ordersChannelId = isProduction ? "1331164962059587614" : "1408025970878713928";
const reviewsChannelId = "1339632586602971280";

export async function sendDiscordOrderMessage(data: DiscordMessage) {
  return sendDiscordMessage(ordersChannelId, data);
}

export async function sendDiscordReviewMessage(data: DiscordMessage) {
  return sendDiscordMessage(reviewsChannelId, data);
}

const sendDiscordMessage = async (channelId: string, data: DiscordMessage) => {
  // if (!isProduction) {
  //   console.info("Skipping Discord message in non-production environment");
  //   return;
  // }

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