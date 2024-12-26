import { WebClient } from "@slack/web-api";

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const client = new WebClient(SLACK_TOKEN);

export async function postToSlack(channel: string, message: string) {
  try {
    await client.chat.postMessage({ channel, text: message });
  } catch (error) {
    console.error("Failed to post to Slack", error);
    throw error;
  }
}
