import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

// GET /api/news — Fetches latest headlines via RSS
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providersParam = searchParams.get('providers') || 'global,national,local';
    const selectedProviders = providersParam.split(',').map(p => p.trim().toLowerCase());

    const ALL_FEEDS: Record<string, { name: string, url: string }> = {
      global:   { name: "Global",     url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
      national: { name: "US News",    url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml" },
      uk:       { name: "UK News",    url: "http://feeds.bbci.co.uk/news/uk/rss.xml" },
      local:    { name: "NY Region",  url: "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml" },
      tech:     { name: "Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
      business: { name: "Business",   url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
    };

    const feeds = selectedProviders.map(p => ALL_FEEDS[p]).filter(Boolean);
    if (!feeds.length) feeds.push(ALL_FEEDS.global);

    const aggregatedItems: any[] = [];

    // Fetch in parallel
    await Promise.all(feeds.map(async (f) => {
      try {
        const feed = await parser.parseURL(f.url);
        const top3 = feed.items.slice(0, 3).map((item: any) => ({
          category: f.name,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet,
        }));
        aggregatedItems.push(...top3);
      } catch (err) {
        console.warn(`Failed to fetch ${f.name} RSS`, err);
      }
    }));

    // Optionally sort them or interleave them; we'll return structured
    return NextResponse.json({
      title: "Aggregated News",
      items: aggregatedItems
    });
  } catch (error: any) {
    console.error("RSS Fetch Error:", error);
    return NextResponse.json({ message: "Failed to fetch news feed" }, { status: 500 });
  }
}
