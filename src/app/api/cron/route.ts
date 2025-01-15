import { NextRequest, NextResponse } from "next/server";
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

const imageUrls = [
  '/images/image-1.png',
  '/images/image-2.png',
  '/images/image-3.png',
  '/images/image-4.png',
  '/images/image-5.png',
  '/images/image-6.png',
  '/images/image-7.png',
  '/images/image-8.png',
]

function getRandomImageIndex(): number {
  const n = imageUrls.length;
  return Math.floor(Math.random() * n);
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
    console.error("HeyTaco Error Response:", json);
    if (json.includes("Sign in")) {
      throw new Error("Authentication required. Check HeyTaco settings and Referer header.");
    }
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }

  try {
    const leaderboard = json?.leaderboard || [];

    // Sort leaderboard by taco count in descending order
    leaderboard.sort((a: LeaderboardUser, b: LeaderboardUser) => parseInt(b.sum) - parseInt(a.sum));

    // Group users by taco count and assign ranks
    let rank = 1;
    let prevTacos: number | null = null;
    const rankedLeaderboard: { rank: number; users: LeaderboardUser[]; sum: string }[] = [];
    
    leaderboard.forEach((user: LeaderboardUser) => {
      if (parseInt(user.sum) !== prevTacos) {
        rank = rankedLeaderboard.length + 1; // New rank
        rankedLeaderboard.push({ rank, users: [user], sum: user.sum });
      } else {
        // Add user to the current rank group
        rankedLeaderboard[rankedLeaderboard.length - 1].users.push(user);
      }
      prevTacos = parseInt(user.sum);
    });

    return rankedLeaderboard;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error(`Invalid JSON response from HeyTaco: ${json}`);
  }
}
async function postToSlack(message: string) {
  // Read the current counter
  const imageCounter = getRandomImageIndex();
  try {
    await client.chat.postMessage({
      channel: SLACK_CHANNEL,
        text: message,
        attachments: [
          {
            fallback: "HeyTaco Leaderboard",
            image_url: `${process.env.NEXT_PUBLIC_DOMAIN}${imageUrls[imageCounter]}`,
          },
        ],
      });
    } catch (error) {
      console.error(`Failed to send message:`, error);
    }
  }

export async function POST(req: NextRequest) {
  console.log('[%s] Cron Triggered', new Date().toISOString());
  try {
    const { headerText, footerText } = await req.json();
    const leaderboard = await getHeyTacoLeaderboard(7);

    // Add header text
    let message = headerText || defaultHeaderText;
    const topCount = leaderboard.slice(0, 10).length;
    message += `🏆 *ТОП-${topCount} таколидеров:*`;

    // Generate leaderboard message
    leaderboard.slice(0, topCount).forEach(group => {
      const users = group.users.map(user => `<@${user.username}>`).join(' ');
      message += `\n${group.rank}. ${users} — ${group.sum} тако`;
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
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('[%s] Unauthorized', new Date().toISOString());
    return new Response('Unauthorized', {
      status: 401,
    });
  }
  
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