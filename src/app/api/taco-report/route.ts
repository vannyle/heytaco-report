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
  const response = await fetch(url, {
    headers: {
      Referer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Set your app's URL
    },
  });

  const text = await response.text(); // Fetch response as text for debugging
  if (!response.ok) {
    console.error("HeyTaco Error Response:", text); // Log the full error response
    if (text.includes("Sign in")) {
      throw new Error("Authentication required. Check HeyTaco settings and Referer header.");
    }
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }

  try {
    return JSON.parse(text).leaderboard;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error(`Invalid JSON response from HeyTaco: ${text}`);
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