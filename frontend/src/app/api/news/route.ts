import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

// GET /api/news — Fetches latest headlines via RSS
export async function GET(req: NextRequest) {
  try {
    // Default RSS: BBC World News
    const RSS_URL = "http://feeds.bbci.co.uk/news/world/rss.xml";
    
    const feed = await parser.parseURL(RSS_URL);
    
    const items = feed.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
    })).slice(0, 5); // Just the top 5 for the mirror

    return NextResponse.json({ 
      title: feed.title,
      items 
    });
  } catch (error: any) {
    console.error("RSS Fetch Error:", error);
    return NextResponse.json({ message: "Failed to fetch news feed" }, { status: 500 });
  }
}
