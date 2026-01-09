import { NextResponse } from "next/server";
import { searchPeopleByDomain } from "@/lib/apollo";

const TAVILY_API_URL = "https://api.tavily.com/search";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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

async function generateBriefWithOpenAI(domain, searchData, companyName, hasApolloStakeholders) {
  // Prepare context from all search results
  const formatResults = (results, label) => {
    if (!results || results.length === 0) return `${label}: No results found`;
    return `${label}:\n${results
      .slice(0, 5)
      .map(
        (result, idx) =>
          `  ${idx + 1}. "${result.title}"\n     ${result.content}\n     URL: ${result.url}`
      )
      .join("\n\n")}`;
  };

  const searchContext = [
    formatResults(searchData.sustainability, "SUSTAINABILITY & ESG DATA"),
    formatResults(searchData.news, "RECENT NEWS"),
    formatResults(searchData.companyInfo, "COMPANY INFORMATION"),
  ].join("\n\n---\n\n");

  // Adjust prompt based on whether we have Apollo stakeholders
  const stakeholderInstruction = hasApolloStakeholders
    ? `"stakeholders": [] // Leave empty - we have verified stakeholder data from Apollo`
    : `"stakeholders": [
    {
      "name": "<full name>",
      "title": "<job title>",
      "linkedinUrl": "<LinkedIn URL if found, otherwise construct: https://linkedin.com/in/firstname-lastname>"
    }
  ] // Find 3-5 key people: CSO, VP Sustainability, CFO, VP Procurement`;

  const prompt = `You are an expert GTM analyst for Patch.io, a carbon credit marketplace and climate API platform that helps companies:
- Purchase verified carbon credits from high-quality removal and avoidance projects
- Integrate carbon offsetting into products/checkout flows via API
- Track and report on carbon credit portfolios for ESG compliance
- Meet net-zero commitments with transparent, verified offsets

Analyze the following research for ${companyName} (${domain}) and generate a sales-ready account brief.

${searchContext}

Generate a JSON response with the following structure (valid JSON only, no markdown code blocks):
{
  "company": {
    "name": "<official company name>",
    "industry": "<primary industry>",
    "size": "<employee count range, e.g., '1,000 - 5,000 employees'>",
    "headquarters": "<city, state/country>",
    "funding": "<funding status: Public, Private, or latest funding round>",
    "description": "<1-2 sentence company description>"
  },
  "icpScore": {
    "score": <number 0-100>,
    "reasoning": "<1-2 sentence explanation focusing on their carbon credit/offset needs>"
  },
  "sustainabilitySignals": [
    "<signal 1 - net-zero or carbon neutrality commitments with target year>",
    "<signal 2 - climate pledges: Science Based Targets (SBTi), Climate Pledge, Race to Zero, RE100>",
    "<signal 3 - ESG reporting: CDP disclosure, TCFD alignment, sustainability reports>",
    "<signal 4 - carbon offset/credit purchases or renewable energy investments>",
    "<signal 5 - sustainability leadership hires or dedicated teams>"
  ],
  ${stakeholderInstruction},
  "talkingPoints": [
    "<point 1 - specific carbon offset opportunity based on their net-zero timeline>",
    "<point 2 - how Patch.io helps with their specific climate pledge commitments>",
    "<point 3 - ESG reporting angle: CSRD, SEC climate rules, CDP scoring improvement>",
    "<point 4 - competitive/industry angle: how peers are using carbon credits>"
  ]
}

IMPORTANT GUIDELINES:

1. COMPANY INFO: Extract real data from search results. If not found, make reasonable inferences.

2. ICP SCORING (Ideal Customer Profile for carbon credit purchases):
   - 90-100: Perfect fit - Public net-zero commitment, SBTi validated, enterprise scale, actively purchasing offsets
   - 75-89: Strong fit - Climate pledges (Climate Pledge, Race to Zero), ESG reporting, likely need carbon credits
   - 60-74: Good fit - Sustainability initiatives, mid-market+, would benefit from carbon offsetting
   - 40-59: Moderate fit - Some ESG activity, unclear carbon strategy, needs education
   - 0-39: Weak fit - No visible climate commitments or too small scale

3. SUSTAINABILITY SIGNALS: Prioritize signals that indicate carbon credit buying intent:
   - Net-zero or carbon neutral commitments (with dates)
   - Climate coalition memberships (SBTi, Climate Pledge, Race to Zero, RE100)
   - Scope 1/2/3 emissions tracking or disclosure
   - Previous carbon offset purchases
   - CDP participation or sustainability reporting

4. TALKING POINTS: Make them Patch.io-specific and actionable:
   - Reference their exact net-zero year and how Patch helps bridge the gap
   - Mention specific climate pledges and Patch's verified credit portfolio
   - Tie to upcoming regulations (CSRD in EU, SEC climate disclosure, California rules)
   - Reference how competitors or industry leaders are using carbon credits
   - If they have an API/platform, mention Patch's API for embedded carbon offsetting`;

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
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse the JSON response - handle potential markdown code blocks
  try {
    // Remove markdown code blocks if present
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error(`Failed to parse OpenAI response as JSON`);
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

    // Run Tavily searches and Apollo search in parallel
    const [
      sustainabilityResults,
      newsResults,
      companyInfoResults,
      apolloStakeholders,
    ] = await Promise.all([
      // Carbon & climate commitments from company site
      searchTavily(`site:${cleanDomain} carbon neutral net-zero emissions climate commitment 2030 2040 2050`),
      // Climate pledges and ESG news
      searchTavily(`"${companyName}" "Science Based Targets" OR "Climate Pledge" OR "carbon offset" OR "net-zero" OR "CDP" 2024 2025`),
      // Company information from Tavily
      searchTavily(`"${companyName}" company overview employees headquarters founded industry`),
      // Stakeholders from Apollo (verified data)
      searchPeopleByDomain(cleanDomain),
    ]);

    // Organize search data for OpenAI
    const searchData = {
      sustainability: sustainabilityResults.results || [],
      news: newsResults.results || [],
      companyInfo: companyInfoResults.results || [],
    };

    // Combine all Tavily results for reference
    const allResults = [
      ...searchData.sustainability,
      ...searchData.news,
      ...searchData.companyInfo,
    ];

    const seenUrls = new Set();
    const uniqueResults = allResults.filter((result) => {
      if (seenUrls.has(result.url)) return false;
      seenUrls.add(result.url);
      return true;
    });

    // Check if we have Apollo stakeholders
    const hasApolloStakeholders = apolloStakeholders && apolloStakeholders.length > 0;

    // Generate brief with OpenAI (company info, ICP score, signals, talking points)
    const briefContent = await generateBriefWithOpenAI(
      cleanDomain,
      searchData,
      companyName,
      hasApolloStakeholders
    );

    // Use Apollo stakeholders if available, otherwise fall back to OpenAI-generated ones
    const finalStakeholders = hasApolloStakeholders
      ? apolloStakeholders
      : briefContent.stakeholders || [];

    return NextResponse.json({
      domain: cleanDomain,
      companyName: briefContent.company?.name || companyName,
      company: briefContent.company,
      icpScore: briefContent.icpScore,
      sustainabilitySignals: briefContent.sustainabilitySignals,
      stakeholders: finalStakeholders,
      stakeholderSource: hasApolloStakeholders ? "apollo" : "openai",
      talkingPoints: briefContent.talkingPoints,
      searchResults: uniqueResults.slice(0, 6),
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
