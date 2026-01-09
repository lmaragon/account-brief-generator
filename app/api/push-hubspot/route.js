import { NextResponse } from "next/server";
import {
  findCompanyByDomain,
  createCompany,
  updateCompany,
  findContactByEmail,
  createContact,
  associateContactWithCompany,
  createNote,
} from "@/lib/hubspot";

export async function POST(request) {
  try {
    const { domain, company, icpScore, sustainabilitySignals, stakeholders, talkingPoints } =
      await request.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "HUBSPOT_ACCESS_TOKEN is not configured" },
        { status: 500 }
      );
    }

    // Prepare brief summary for storage
    const briefSummary = {
      icpScore: icpScore?.score,
      icpReasoning: icpScore?.reasoning,
      sustainabilitySignals: sustainabilitySignals?.slice(0, 5),
      talkingPoints: talkingPoints?.slice(0, 4),
      generatedAt: new Date().toISOString(),
    };

    // Step 1: Find or create company
    let hubspotCompany = await findCompanyByDomain(domain);
    let companyCreated = false;

    if (hubspotCompany) {
      // Update existing company
      hubspotCompany = await updateCompany(hubspotCompany.id, company || {}, briefSummary);
    } else {
      // Create new company
      hubspotCompany = await createCompany(company || {}, domain, briefSummary);
      companyCreated = true;
    }

    const companyId = hubspotCompany.id;

    // Step 2: Create contacts for stakeholders
    const createdContacts = [];
    const skippedContacts = [];

    if (stakeholders && stakeholders.length > 0) {
      for (const stakeholder of stakeholders) {
        try {
          // Check if contact already exists (by email if available)
          let existingContact = null;
          if (stakeholder.email) {
            existingContact = await findContactByEmail(stakeholder.email);
          }

          if (existingContact) {
            // Associate existing contact with company
            await associateContactWithCompany(existingContact.id, companyId);
            skippedContacts.push({
              name: stakeholder.name,
              reason: "Already exists",
            });
          } else {
            // Create new contact
            const newContact = await createContact(stakeholder);
            if (newContact && newContact.id) {
              // Associate with company
              await associateContactWithCompany(newContact.id, companyId);
              createdContacts.push({
                name: stakeholder.name,
                id: newContact.id,
              });
            }
          }
        } catch (contactError) {
          console.error(`Error creating contact ${stakeholder.name}:`, contactError);
          skippedContacts.push({
            name: stakeholder.name,
            reason: contactError.message,
          });
        }
      }
    }

    // Step 3: Create a note with the full brief
    const noteBody = formatBriefAsNote(domain, company, icpScore, sustainabilitySignals, talkingPoints);
    await createNote(companyId, noteBody);

    // Generate HubSpot URL (using default format, user can customize)
    const hubspotUrl = `https://app.hubspot.com/contacts/companies/${companyId}`;

    return NextResponse.json({
      success: true,
      companyId,
      companyCreated,
      hubspotUrl,
      contactsCreated: createdContacts.length,
      contactsSkipped: skippedContacts.length,
      details: {
        createdContacts,
        skippedContacts,
      },
    });
  } catch (error) {
    console.error("Push to HubSpot error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to push to HubSpot" },
      { status: 500 }
    );
  }
}

/**
 * Format the brief data as a readable note
 */
function formatBriefAsNote(domain, company, icpScore, sustainabilitySignals, talkingPoints) {
  const lines = [
    `📊 SUSTAINABILITY ACCOUNT BRIEF`,
    `Generated: ${new Date().toLocaleDateString()}`,
    `Domain: ${domain}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
  ];

  // ICP Score
  if (icpScore) {
    lines.push(`🎯 ICP FIT SCORE: ${icpScore.score}/100`);
    lines.push(`${icpScore.reasoning}`);
    lines.push(``);
  }

  // Company Info
  if (company) {
    lines.push(`🏢 COMPANY OVERVIEW`);
    if (company.name) lines.push(`• Name: ${company.name}`);
    if (company.industry) lines.push(`• Industry: ${company.industry}`);
    if (company.size) lines.push(`• Size: ${company.size}`);
    if (company.headquarters) lines.push(`• HQ: ${company.headquarters}`);
    if (company.funding) lines.push(`• Funding: ${company.funding}`);
    lines.push(``);
  }

  // Sustainability Signals
  if (sustainabilitySignals && sustainabilitySignals.length > 0) {
    lines.push(`🌱 SUSTAINABILITY SIGNALS`);
    sustainabilitySignals.forEach((signal) => {
      lines.push(`• ${signal}`);
    });
    lines.push(``);
  }

  // Talking Points
  if (talkingPoints && talkingPoints.length > 0) {
    lines.push(`💬 TALKING POINTS`);
    talkingPoints.forEach((point, idx) => {
      lines.push(`${idx + 1}. ${point}`);
    });
    lines.push(``);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Generated by Sustainability Account Brief Generator`);

  return lines.join("\n");
}
