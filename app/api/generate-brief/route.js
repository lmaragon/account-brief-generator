import { NextResponse } from "next/server";

const TAVILY_API_URL = "https://api.tavily.com/search";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function searchTavily(query) {
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
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function generateBriefWithOpenAI(domain, tavilyResults, companyName) {
  // Prepare context from Tavily results
  const resultsContext = tavilyResults
    .slice(0, 10)
    .map(
      (result, idx) =>
        `${idx + 1}. "${result.title}"\n   ${result.content}\n   Source: ${result.url}`
    )
    .join("\n\n");

  const prompt = `You are an expert GTM analyst specializing in sustainability solutions for Patch.io, a carbon credit marketplace platform.

Analyze the following sustainability research for ${companyName} (${domain}) and generate a structured account brief.

SEARCH RESULTS:
${resultsContext}

Generate a JSON response with the following structure (valid JSON only, no markdown):
{
  "icpScore": {
    "score": <number 0-100>,
    "reasoning": "<1-2 sentence explanation of why this score>"
  },
  "sustainabilitySignals": [
    "<signal 1>",
    "<signal 2>",
    "<signal 3>",
    "<signal 4>",
    "<signal 5>"
  ],
  "talkingPoints": [
    "<point 1 - reference their specific commitments and explain Patch.io relevance>",
    "<point 2 - mention any sustainability roles or recent hires>",
    "<point 3 - reference their ESG/climate pledges or memberships>",
    "<point 4 - tie to regulatory or reporting requirements>"
  ]
}

SCORING GUIDELINES:
- 80-100: Strong fit (public sustainability goals, enterprise scale, climate-first identity, active ESG)
- 60-79: Medium fit (some sustainability initiatives, mid-market, passive ESG engagement)
- 40-59: Weak fit (limited public ESG, smaller scale, unclear commitment)
- 0-39: Poor fit (no visible sustainability focus)

CONTEXT: We're selling carbon credit marketplace solutions to enterprises. Look for:
- Net-zero commitments and carbon accounting needs
- ESG reporting requirements
- Sustainability teams/officers
- Recent ESG investments or announcements
- Climate pledges (Science-based, Climate Pledge, etc.)`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse the JSON response
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse OpenAI response as JSON: ${content}`);
  }
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Clean the domain
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    // Extract company name from domain
    const companyName = cleanDomain
      .split(".")[0]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Run both Tavily searches in parallel
    const [siteSearchResults, newsSearchResults] = await Promise.all([
      searchTavily(`site:${cleanDomain} sustainability ESG carbon climate`),
      searchTavily(`"${companyName}" sustainability ESG carbon news 2024 2025`),
    ]);

    // Combine and deduplicate results
    const allResults = [
      ...(siteSearchResults.results || []),
      ...(newsSearchResults.results || []),
    ];

    const seenUrls = new Set();
    const uniqueResults = allResults.filter((result) => {
      if (seenUrls.has(result.url)) return false;
      seenUrls.add(result.url);
      return true;
    });

    // Generate brief with OpenAI
    const briefContent = await generateBriefWithOpenAI(
      cleanDomain,
      uniqueResults,
      companyName
    );

    return NextResponse.json({
      domain: cleanDomain,
      companyName,
      icpScore: briefContent.icpScore,
      sustainabilitySignals: briefContent.sustainabilitySignals,
      talkingPoints: briefContent.talkingPoints,
      searchResults: uniqueResults.slice(0, 6), // Include top results for reference
      totalSearchResults: uniqueResults.length,
    });
  } catch (error) {
    console.error("Generate brief error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate brief" },
      { status: 500 }
    );
  }
}
