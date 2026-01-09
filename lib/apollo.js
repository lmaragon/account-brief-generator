// Apollo.io API client for people search

const APOLLO_API_URL = "https://api.apollo.io/v1/mixed_people/search";

/**
 * Search for people at a company by domain and job titles
 * @param {string} domain - Company domain (e.g., "patagonia.com")
 * @param {object} options - Search options
 * @returns {Promise<Array>} - Array of people with name, title, linkedinUrl, email
 */
export async function searchPeopleByDomain(domain, options = {}) {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    console.warn("APOLLO_API_KEY not configured, skipping Apollo search");
    return [];
  }

  // Default titles to search for - focused on sustainability, finance, and procurement
  const defaultTitles = [
    "Chief Sustainability Officer",
    "VP Sustainability",
    "Head of Sustainability",
    "Director of Sustainability",
    "ESG Director",
    "Chief Financial Officer",
    "CFO",
    "VP Finance",
    "VP Procurement",
    "Head of Procurement",
    "Chief Operating Officer",
    "COO",
  ];

  const titles = options.titles || defaultTitles;
  const perPage = options.perPage || 10;

  try {
    const response = await fetch(APOLLO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        q_organization_domains: domain,
        person_titles: titles,
        person_seniorities: ["c_suite", "vp", "director"],
        page: 1,
        per_page: perPage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apollo API error:", response.status, errorText);
      return [];
    }

    const data = await response.json();

    if (!data.people || data.people.length === 0) {
      console.log("No people found in Apollo for domain:", domain);
      return [];
    }

    // Transform Apollo response to our stakeholder format
    const stakeholders = data.people.slice(0, 5).map((person) => ({
      name: person.name || `${person.first_name} ${person.last_name}`.trim(),
      title: person.title || "Unknown Title",
      linkedinUrl: person.linkedin_url || null,
      email: person.email || null,
      photoUrl: person.photo_url || null,
      // Additional data that might be useful
      city: person.city,
      state: person.state,
      country: person.country,
    }));

    return stakeholders;
  } catch (error) {
    console.error("Apollo search error:", error);
    return [];
  }
}

/**
 * Search for company information by domain
 * @param {string} domain - Company domain
 * @returns {Promise<object|null>} - Company info or null
 */
export async function searchCompanyByDomain(domain) {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.apollo.io/v1/organizations/enrich", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      // Apollo uses query params for this endpoint
    });

    // Note: This would need the proper endpoint - for now we'll rely on Tavily for company data
    return null;
  } catch (error) {
    console.error("Apollo company search error:", error);
    return null;
  }
}
