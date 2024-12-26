import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";
import { WebClient } from "@slack/web-api";

const HEYTACO_API_URL = "https://www.heytaco.chat/api/v1/json/leaderboard/TH7M78TD1";
const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
// const SLACK_CHANNEL = "#general";
const SLACK_CHANNEL = "#heytaco-report-test";

const client = new WebClient(SLACK_TOKEN);

interface LeaderboardUser {
  username: string;
  sum: string;
}

async function getHeyTacoLeaderboard(days: number = 7) {
  const url = `${HEYTACO_API_URL}?days=${days}`;
  const response = await fetch(url);
  
  const responseBody = await response.text(); // Log as text for debugging
  console.log("API Response:", responseBody);

  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }

  try {
    return JSON.parse(responseBody).leaderboard;
  } catch (err) {
    console.log(err);
    throw new Error(`Invalid JSON response: ${responseBody}`);
  }
}

async function postToSlack(message: string) {
  try {
    await client.chat.postMessage({
      channel: SLACK_CHANNEL,
      text: message,
    });
  } catch (error) {
    console.error("Failed to send message to Slack:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customText } = await req.json(); // Accept custom text from the request body
    const leaderboard = await getHeyTacoLeaderboard(7);

    // Create the Slack message
    let message = customText || "🌮 *Weekly HeyTaco Report* 🌮\n\n*Top Taco Receivers:*\n1. User1 - 10 tacos\n2. User2 - 8 tacos\n3. User3 - 7 tacos\n";
    message += "*Top Taco Receivers:*\n";
    leaderboard.forEach((user: LeaderboardUser, index: number) => {
      message += `${index + 1}. ${user.username} - ${user.sum} tacos\n`;
    });
    message += "\nGreat job, team! 🎉";

    // Post to Slack  
    await postToSlack(message);

    return NextResponse.json({ success: true, message: "Report sent successfully to Slack." });
  } catch (error) {
    console.error("Error in report generation:", error);
    return NextResponse.json({ success: false, error: "Failed to generate report." }, { status: 500 });
  }
}