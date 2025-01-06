import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";
import { WebClient } from "@slack/web-api";
import { defaultFooterText, defaultHeaderText } from "src/app/utils/constants";

const HEYTACO_API_URL = "https://www.heytaco.chat/api/v1/json/leaderboard/TH7M78TD1";
const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const HEYTACO_COOKIE = process.env.HEYTACO_COOKIE;
// const SLACK_CHANNEL = "#general";
const SLACK_CHANNEL = "#heytaco-report-test";

const client = new WebClient(SLACK_TOKEN);

interface LeaderboardUser {
  username: string;
  sum: string;
}

async function getHeyTacoLeaderboard(days: number = 1) {
  const url = `${HEYTACO_API_URL}?days=${days}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': HEYTACO_COOKIE as string, 
    }
  });
  const json = await response.json();
  

  if (!response.ok) {
    console.error("HeyTaco Error Response:", json); // Log the full error response
    if (json.includes("Sign in")) {
      throw new Error("Authentication required. Check HeyTaco settings and Referer header.");
    }
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }

  try {
    return json?.leaderboard;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error(`Invalid JSON response from HeyTaco: ${json}`);
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
  // Authorization check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    
  try {
    const { headerText, footerText } = await req.json(); // Accept custom text from the request body
    const leaderboard = await getHeyTacoLeaderboard(7);

    // Add header text
    let message = headerText || defaultHeaderText; 

    // List top 3 taco receivers
    leaderboard.slice(0, 3).forEach((user: LeaderboardUser, index: number) => {
      message += `\n${index + 1}. <@${user.username}> - ${user.sum} ${user.sum === "1" ? "taco" : "tacos"}`;
    });

    // Add footer text
    message += footerText ? "\n" + footerText : "\n" + defaultFooterText;
    
    // Post to Slack  
    await postToSlack(message);

    return NextResponse.json({ success: true, message: "Report sent successfully to Slack." });
  } catch (error) {
    console.error("Error in report generation:", error);
    return NextResponse.json({ success: false, error: "Failed to generate report." }, { status: 500 });
  }
}

// get query that calls the POST function with default parameters
export async function GET() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost';
  const mockRequest = new Request(`${domain}`, {
    method: 'POST',
    body: JSON.stringify({
      headerText: defaultHeaderText,
      footerText: defaultFooterText
    })
  });
  return POST(new NextRequest(mockRequest));
}