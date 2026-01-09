// HubSpot API client for CRM operations

const HUBSPOT_API_BASE = "https://api.hubapi.com";

/**
 * Get the HubSpot access token from environment
 */
function getAccessToken() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not configured");
  }
  return token;
}

/**
 * Make an authenticated request to HubSpot API
 */
async function hubspotFetch(endpoint, options = {}) {
  const token = getAccessToken();
  const url = `${HUBSPOT_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API error: ${response.status} - ${error}`);
  }

  // Some endpoints return empty response
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Search for a company by domain
 * @param {string} domain - Company domain
 * @returns {Promise<object|null>} - Company object or null if not found
 */
export async function findCompanyByDomain(domain) {
  try {
    const response = await hubspotFetch("/crm/v3/objects/companies/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "domain",
                operator: "EQ",
                value: domain,
              },
            ],
          },
        ],
        properties: ["name", "domain", "industry", "numberofemployees", "city", "state", "country"],
      }),
    });

    if (response.results && response.results.length > 0) {
      return response.results[0];
    }
    return null;
  } catch (error) {
    console.error("Error finding company:", error);
    return null;
  }
}

// Valid HubSpot industry values
const HUBSPOT_INDUSTRIES = [
  "ACCOUNTING", "AIRLINES_AVIATION", "ALTERNATIVE_DISPUTE_RESOLUTION", "ALTERNATIVE_MEDICINE",
  "ANIMATION", "APPAREL_FASHION", "ARCHITECTURE_PLANNING", "ARTS_AND_CRAFTS", "AUTOMOTIVE",
  "AVIATION_AEROSPACE", "BANKING", "BIOTECHNOLOGY", "BROADCAST_MEDIA", "BUILDING_MATERIALS",
  "BUSINESS_SUPPLIES_AND_EQUIPMENT", "CAPITAL_MARKETS", "CHEMICALS", "CIVIC_SOCIAL_ORGANIZATION",
  "CIVIL_ENGINEERING", "COMMERCIAL_REAL_ESTATE", "COMPUTER_NETWORK_SECURITY", "COMPUTER_GAMES",
  "COMPUTER_HARDWARE", "COMPUTER_NETWORKING", "COMPUTER_SOFTWARE", "INTERNET", "CONSTRUCTION",
  "CONSUMER_ELECTRONICS", "CONSUMER_GOODS", "CONSUMER_SERVICES", "COSMETICS", "DAIRY",
  "DEFENSE_SPACE", "DESIGN", "EDUCATION_MANAGEMENT", "E_LEARNING", "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "ENTERTAINMENT", "ENVIRONMENTAL_SERVICES", "EVENTS_SERVICES", "EXECUTIVE_OFFICE", "FACILITIES_SERVICES",
  "FARMING", "FINANCIAL_SERVICES", "FINE_ART", "FISHERY", "FOOD_BEVERAGES", "FOOD_PRODUCTION",
  "FUND_RAISING", "FURNITURE", "GAMBLING_CASINOS", "GLASS_CERAMICS_CONCRETE", "GOVERNMENT_ADMINISTRATION",
  "GOVERNMENT_RELATIONS", "GRAPHIC_DESIGN", "HEALTH_WELLNESS_AND_FITNESS", "HIGHER_EDUCATION",
  "HOSPITAL_HEALTH_CARE", "HOSPITALITY", "HUMAN_RESOURCES", "IMPORT_AND_EXPORT",
  "INDIVIDUAL_FAMILY_SERVICES", "INDUSTRIAL_AUTOMATION", "INFORMATION_SERVICES",
  "INFORMATION_TECHNOLOGY_AND_SERVICES", "INSURANCE", "INTERNATIONAL_AFFAIRS",
  "INTERNATIONAL_TRADE_AND_DEVELOPMENT", "INVESTMENT_BANKING", "INVESTMENT_MANAGEMENT",
  "JUDICIARY", "LAW_ENFORCEMENT", "LAW_PRACTICE", "LEGAL_SERVICES", "LEGISLATIVE_OFFICE",
  "LEISURE_TRAVEL_TOURISM", "LIBRARIES", "LOGISTICS_AND_SUPPLY_CHAIN", "LUXURY_GOODS_JEWELRY",
  "MACHINERY", "MANAGEMENT_CONSULTING", "MARITIME", "MARKET_RESEARCH", "MARKETING_AND_ADVERTISING",
  "MECHANICAL_OR_INDUSTRIAL_ENGINEERING", "MEDIA_PRODUCTION", "MEDICAL_DEVICES", "MEDICAL_PRACTICE",
  "MENTAL_HEALTH_CARE", "MILITARY", "MINING_METALS", "MOTION_PICTURES_AND_FILM",
  "MUSEUMS_AND_INSTITUTIONS", "MUSIC", "NANOTECHNOLOGY", "NEWSPAPERS",
  "NON_PROFIT_ORGANIZATION_MANAGEMENT", "OIL_ENERGY", "ONLINE_MEDIA", "OUTSOURCING_OFFSHORING",
  "PACKAGE_FREIGHT_DELIVERY", "PACKAGING_AND_CONTAINERS", "PAPER_FOREST_PRODUCTS", "PERFORMING_ARTS",
  "PHARMACEUTICALS", "PHILANTHROPY", "PHOTOGRAPHY", "PLASTICS", "POLITICAL_ORGANIZATION",
  "PRIMARY_SECONDARY_EDUCATION", "PRINTING", "PROFESSIONAL_TRAINING_COACHING", "PROGRAM_DEVELOPMENT",
  "PUBLIC_POLICY", "PUBLIC_RELATIONS_AND_COMMUNICATIONS", "PUBLIC_SAFETY", "PUBLISHING",
  "RAILROAD_MANUFACTURE", "RANCHING", "REAL_ESTATE", "RECREATIONAL_FACILITIES_AND_SERVICES",
  "RELIGIOUS_INSTITUTIONS", "RENEWABLES_ENVIRONMENT", "RESEARCH", "RESTAURANTS", "RETAIL",
  "SECURITY_AND_INVESTIGATIONS", "SEMICONDUCTORS", "SHIPBUILDING", "SPORTING_GOODS", "SPORTS",
  "STAFFING_AND_RECRUITING", "SUPERMARKETS", "TELECOMMUNICATIONS", "TEXTILES", "THINK_TANKS",
  "TOBACCO", "TRANSLATION_AND_LOCALIZATION", "TRANSPORTATION_TRUCKING_RAILROAD", "UTILITIES",
  "VENTURE_CAPITAL_PRIVATE_EQUITY", "VETERINARY", "WAREHOUSING", "WHOLESALE", "WINE_AND_SPIRITS",
  "WIRELESS", "WRITING_AND_EDITING", "MOBILE_GAMES"
];

/**
 * Map industry string to valid HubSpot industry value
 */
function mapToHubSpotIndustry(industry) {
  if (!industry) return null;

  // Normalize the input
  const normalized = industry.toUpperCase().replace(/[^A-Z]/g, "_").replace(/_+/g, "_");

  // Direct match
  if (HUBSPOT_INDUSTRIES.includes(normalized)) {
    return normalized;
  }

  // Common mappings
  const mappings = {
    "RETAIL": "RETAIL",
    "APPAREL": "APPAREL_FASHION",
    "FASHION": "APPAREL_FASHION",
    "OUTDOOR": "SPORTING_GOODS",
    "OUTDOORS": "SPORTING_GOODS",
    "TECHNOLOGY": "INFORMATION_TECHNOLOGY_AND_SERVICES",
    "TECH": "INFORMATION_TECHNOLOGY_AND_SERVICES",
    "SOFTWARE": "COMPUTER_SOFTWARE",
    "SAAS": "COMPUTER_SOFTWARE",
    "FINANCE": "FINANCIAL_SERVICES",
    "HEALTHCARE": "HOSPITAL_HEALTH_CARE",
    "HEALTH": "HEALTH_WELLNESS_AND_FITNESS",
    "ENERGY": "OIL_ENERGY",
    "RENEWABLE": "RENEWABLES_ENVIRONMENT",
    "SUSTAINABILITY": "ENVIRONMENTAL_SERVICES",
    "CONSULTING": "MANAGEMENT_CONSULTING",
    "MANUFACTURING": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
    "MEDIA": "MEDIA_PRODUCTION",
    "FOOD": "FOOD_BEVERAGES",
    "BEVERAGE": "FOOD_BEVERAGES",
    "TRAVEL": "LEISURE_TRAVEL_TOURISM",
    "HOSPITALITY": "HOSPITALITY",
    "EDUCATION": "EDUCATION_MANAGEMENT",
    "NONPROFIT": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
    "NON_PROFIT": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  };

  // Check for partial matches in mappings
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // No match found
  return null;
}

/**
 * Create a new company in HubSpot
 * @param {object} companyData - Company data from brief
 * @param {string} domain - Company domain
 * @param {object} briefSummary - Brief summary (stored in note, not as property)
 * @returns {Promise<object>} - Created company object
 */
export async function createCompany(companyData, domain, briefSummary) {
  const properties = {
    name: companyData.name || domain,
    domain: domain,
    city: companyData.headquarters?.split(",")[0]?.trim() || "",
    description: companyData.description || "",
  };

  // Only set industry if we can map it to a valid HubSpot value
  const mappedIndustry = mapToHubSpotIndustry(companyData.industry);
  if (mappedIndustry) {
    properties.industry = mappedIndustry;
  }

  // Try to parse employee count
  if (companyData.size) {
    const sizeMatch = companyData.size.match(/[\d,]+/);
    if (sizeMatch) {
      properties.numberofemployees = parseInt(sizeMatch[0].replace(/,/g, ""), 10);
    }
  }

  const response = await hubspotFetch("/crm/v3/objects/companies", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return response;
}

/**
 * Update an existing company in HubSpot
 * @param {string} companyId - HubSpot company ID
 * @param {object} companyData - Company data from brief
 * @param {object} briefSummary - Brief summary to store
 * @returns {Promise<object>} - Updated company object
 */
export async function updateCompany(companyId, companyData, briefSummary) {
  const properties = {
    description: companyData.description || "",
  };

  // Only set industry if we can map it to a valid HubSpot value
  const mappedIndustry = mapToHubSpotIndustry(companyData.industry);
  if (mappedIndustry) {
    properties.industry = mappedIndustry;
  }

  // Try to parse employee count
  if (companyData.size) {
    const sizeMatch = companyData.size.match(/[\d,]+/);
    if (sizeMatch) {
      properties.numberofemployees = parseInt(sizeMatch[0].replace(/,/g, ""), 10);
    }
  }

  const response = await hubspotFetch(`/crm/v3/objects/companies/${companyId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });

  return response;
}

/**
 * Search for a contact by email
 * @param {string} email - Contact email
 * @returns {Promise<object|null>} - Contact object or null
 */
export async function findContactByEmail(email) {
  try {
    const response = await hubspotFetch("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["firstname", "lastname", "email", "jobtitle"],
      }),
    });

    if (response.results && response.results.length > 0) {
      return response.results[0];
    }
    return null;
  } catch (error) {
    console.error("Error finding contact:", error);
    return null;
  }
}

/**
 * Create a new contact in HubSpot
 * @param {object} stakeholder - Stakeholder data
 * @returns {Promise<object>} - Created contact object
 */
export async function createContact(stakeholder) {
  // Parse name into first/last
  const nameParts = (stakeholder.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const properties = {
    firstname: firstName,
    lastname: lastName,
    jobtitle: stakeholder.title || "",
  };

  // Only add email if it exists and is valid
  if (stakeholder.email && stakeholder.email.includes("@")) {
    properties.email = stakeholder.email;
  }

  // Add LinkedIn URL if available
  if (stakeholder.linkedinUrl) {
    properties.hs_linkedinid = stakeholder.linkedinUrl;
  }

  // Add location if available
  if (stakeholder.city) {
    properties.city = stakeholder.city;
  }
  if (stakeholder.state) {
    properties.state = stakeholder.state;
  }
  if (stakeholder.country) {
    properties.country = stakeholder.country;
  }

  const response = await hubspotFetch("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });

  return response;
}

/**
 * Associate a contact with a company
 * @param {string} contactId - HubSpot contact ID
 * @param {string} companyId - HubSpot company ID
 */
export async function associateContactWithCompany(contactId, companyId) {
  await hubspotFetch(
    `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
    {
      method: "PUT",
    }
  );
}

/**
 * Create an engagement note on a company
 * @param {string} companyId - HubSpot company ID
 * @param {string} noteBody - Note content
 * @returns {Promise<object>} - Created note object
 */
export async function createNote(companyId, noteBody) {
  try {
    // Create the note
    const noteResponse = await hubspotFetch("/crm/v3/objects/notes", {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: new Date().toISOString(),
        },
      }),
    });

    // Associate note with company
    if (noteResponse && noteResponse.id) {
      await hubspotFetch(
        `/crm/v3/objects/notes/${noteResponse.id}/associations/companies/${companyId}/note_to_company`,
        {
          method: "PUT",
        }
      );
    }

    return noteResponse;
  } catch (error) {
    console.error("Error creating note:", error);
    // Don't fail the whole operation if note creation fails
    return null;
  }
}

/**
 * Get the HubSpot portal ID for generating links
 * @returns {Promise<string>} - Portal ID
 */
export async function getPortalId() {
  try {
    const response = await hubspotFetch("/account-info/v3/api-usage/daily/private-apps");
    return response.portalId?.toString() || "";
  } catch (error) {
    // Try alternative endpoint
    try {
      const response = await hubspotFetch("/integrations/v1/me");
      return response.portalId?.toString() || "";
    } catch {
      console.error("Could not get portal ID:", error);
      return "";
    }
  }
}
