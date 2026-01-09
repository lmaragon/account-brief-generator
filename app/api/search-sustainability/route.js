import { NextResponse } from "next/server";

const TAVILY_API_URL = "https://api.tavily.com/search";

async function searchTavily(query, options = {}) {
  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      include_answer: true,
      include_raw_content: false,
      max_results: 5,
      ...options,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function POST(request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json(
        { error: "TAVILY_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Clean the domain (remove protocol, www, trailing slashes)
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    // Extract company name from domain (e.g., "patagonia.com" -> "Patagonia")
    const companyName = cleanDomain
      .split(".")[0]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Run both searches in parallel
    const [siteSearchResults, newsSearchResults] = await Promise.all([
      // Query A: Company's own sustainability pages
      searchTavily(`site:${cleanDomain} sustainability ESG carbon climate`),
      // Query B: Recent sustainability news
      searchTavily(`"${companyName}" sustainability ESG carbon news 2024 2025`, {
        include_domains: [],
        exclude_domains: [],
      }),
    ]);

    // Combine and deduplicate results
    const allResults = [
      ...(siteSearchResults.results || []),
      ...(newsSearchResults.results || []),
    ];

    // Remove duplicates based on URL
    const seenUrls = new Set();
    const uniqueResults = allResults.filter((result) => {
      if (seenUrls.has(result.url)) return false;
      seenUrls.add(result.url);
      return true;
    });

    return NextResponse.json({
      domain: cleanDomain,
      companyName,
      results: uniqueResults,
      siteSearchAnswer: siteSearchResults.answer,
      newsSearchAnswer: newsSearchResults.answer,
      totalResults: uniqueResults.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search for sustainability data" },
      { status: 500 }
    );
  }
}
