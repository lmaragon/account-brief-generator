"use client";

import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorks() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">How It Works</h1>
            <p className="text-muted-foreground">
              Technical architecture and data flow for the Sustainability Account Brief Generator.
            </p>
          </div>

          {/* Architecture Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre text-xs leading-relaxed">{`
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│                    (Next.js + shadcn/ui)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/generate-brief                          │
│                   (API Orchestration Layer)                     │
└───────┬─────────────────┬─────────────────┬─────────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Tavily API  │ │  Apollo.io    │ │  OpenAI API   │
│               │ │               │ │               │
│ • Site search │ │ • People      │ │ • GPT-4o-mini │
│ • News search │ │   search      │ │ • Brief gen   │
│ • Company     │ │ • Verified    │ │ • ICP scoring │
│   info        │ │   contacts    │ │ • Talking pts │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/push-hubspot                            │
│                    (CRM Integration)                            │
│                                                                 │
│  • Create/update company records                                │
│  • Create contacts for stakeholders                             │
│  • Attach brief as note                                         │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HubSpot CRM                                │
└─────────────────────────────────────────────────────────────────┘
`}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Data Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">User Input</h3>
                    <p className="text-sm text-muted-foreground">
                      User enters a company domain (e.g., "patagonia.com"). The frontend sends a POST request to <code className="bg-muted px-1 rounded">/api/generate-brief</code>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Parallel Data Fetching</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      The API orchestrator runs 4 parallel requests:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li><strong>Tavily #1:</strong> Site search for carbon/climate commitments</li>
                      <li><strong>Tavily #2:</strong> News search for climate pledges (SBTi, CDP, etc.)</li>
                      <li><strong>Tavily #3:</strong> Company overview (size, HQ, industry)</li>
                      <li><strong>Apollo.io:</strong> Verified stakeholders (CSO, CFO, VP Sustainability)</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">AI Brief Generation</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      All search results are sent to OpenAI GPT-4o-mini with a Patch.io-specific prompt that generates:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li><strong>ICP Score:</strong> 0-100 based on carbon credit buying intent</li>
                      <li><strong>Company Overview:</strong> Extracted firmographics</li>
                      <li><strong>Sustainability Signals:</strong> Net-zero commitments, climate pledges</li>
                      <li><strong>Talking Points:</strong> Patch.io-specific sales angles</li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Brief Display</h3>
                    <p className="text-sm text-muted-foreground">
                      The structured brief is returned to the frontend and displayed in cards. Stakeholders show a "Verified" badge when sourced from Apollo.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">CRM Push (Optional)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Clicking "Push to HubSpot" sends data to <code className="bg-muted px-1 rounded">/api/push-hubspot</code> which:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Creates or updates the company record by domain</li>
                      <li>Creates contacts for each stakeholder</li>
                      <li>Associates contacts with the company</li>
                      <li>Attaches the full brief as a note</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Frontend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Next.js 15 (App Router)</li>
                    <li>React 19</li>
                    <li>Tailwind CSS</li>
                    <li>shadcn/ui components</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">APIs & Services</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Tavily - Web search API</li>
                    <li>Apollo.io - People/contact data</li>
                    <li>OpenAI - GPT-4o-mini</li>
                    <li>HubSpot - CRM integration</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Infrastructure</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Vercel - Hosting & deployment</li>
                    <li>Edge Functions - API routes</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Key Patterns</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Parallel API calls (Promise.all)</li>
                    <li>Graceful fallbacks</li>
                    <li>Structured JSON prompts</li>
                    <li>Domain-based deduplication</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ICP Scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ICP Scoring Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The ICP (Ideal Customer Profile) score measures how likely a company is to purchase carbon credits from Patch.io:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm"><strong>90-100:</strong> Perfect fit - Net-zero + SBTi validated + actively buying offsets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm"><strong>75-89:</strong> Strong fit - Climate pledges + ESG reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm"><strong>60-74:</strong> Good fit - Sustainability initiatives, would benefit from offsets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm"><strong>40-59:</strong> Moderate fit - Some ESG activity, needs education</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm"><strong>0-39:</strong> Weak fit - No visible climate commitments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
