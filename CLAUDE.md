We are building an app to show our GTM expertise. Below is the app idea we came up with earlier.

  ---
Sustainability Account Brief Generator

  Overview

  A web app that generates AI-powered account briefs for enterprise sustainability sales. Built to demonstrate GTM engineering skills for Patch.io interview.

  Value Proposition: Enter a company domain → Get a comprehensive brief with firmographics, sustainability signals, key stakeholders, and tailored talking points → Push to HubSpot with one click.

  ---
  Tech Stack

  | Component             | Choice                              |
  |-----------------------|-------------------------------------|
  | Framework             | Next.js 15 (App Router, JavaScript) |
  | Styling               | Tailwind CSS + shadcn/ui            |
  | Hosting               | Vercel (free tier)                  |
  | Company Data          | Clay API                            |
  | Sustainability Search | Tavily API (1,000 free searches/mo) |
  | AI Brief Generation   | OpenAI API (GPT-4o-mini)            |
  | CRM Integration       | HubSpot API (free CRM)              |
  | Database              | None (stateless)                    |

  ---
  Architecture

  ┌─────────────────────────────────────────────────────────────┐
  │                         Vercel                              │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │              Next.js App (App Router)                 │  │
  │  │                                                       │  │
  │  │   Pages:                                              │  │
  │  │   └── /                    Dashboard + Input          │  │
  │  │                                                       │  │
  │  │   API Routes:                                         │  │
  │  │   ├── /api/generate-brief  Main orchestrator          │  │
  │  │   └── /api/push-hubspot    HubSpot sync               │  │
  │  └───────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
                  │               │              │
          ┌───────┴───────┐       │              │
          ▼               ▼       ▼              ▼
     ┌─────────┐    ┌──────────┐ ┌──────┐   ┌─────────┐
     │  Clay   │    │ Tavily   │ │OpenAI│   │HubSpot  │
     │  API    │    │ Search   │ │ API  │   │  API    │
     │         │    │          │ │      │   │         │
     │Firmographics│ │Sustainability│ │Brief │ │CRM Sync │
     │+ People │    │ Signals  │ │ Gen  │   │         │
     └─────────┘    └──────────┘ └──────┘   └─────────┘

  ---
  API Flow: /api/generate-brief

  ┌─────────────────────────────────────────────────────────────┐
  │ 1. INPUT                                                    │
  │    Receive company domain (e.g., "patagonia.com")           │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. CLAY: Company Enrichment                                 │
  │    • Firmographics (size, industry, funding, HQ)            │
  │    • Tech stack                                             │
  │    • Recent funding/news                                    │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. CLAY: People Search                                      │
  │    • Filter by titles: "Sustainability", "ESG", "CSO",      │
  │      "Chief Sustainability", "CFO", "VP Procurement"        │
  │    • Return top 3-5 stakeholders with LinkedIn URLs         │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. TAVILY: Sustainability Search (2 queries)                │
  │                                                             │
  │    Query A: "site:{domain} sustainability ESG carbon"       │
  │    → Company's own sustainability pages/reports             │
  │                                                             │
  │    Query B: "{company name} sustainability news 2024 2025"  │
  │    → Recent news, announcements, pledges                    │
  │                                                             │
  │    Use "deep" search mode for full content extraction       │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. OPENAI: Generate Brief (GPT-4o-mini)                     │
  │                                                             │
  │    Input: All enriched data from steps 2-4                  │
  │                                                             │
  │    Output (structured JSON):                                │
  │    • Company summary                                        │
  │    • ICP fit score (0-100) + reasoning                      │
  │    • Sustainability profile                                 │
  │    • Key stakeholders (formatted)                           │
  │    • 3-5 tailored talking points                            │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. OUTPUT                                                   │
  │    Return structured brief JSON to frontend                 │
  └─────────────────────────────────────────────────────────────┘

  ---
  API Flow: /api/push-hubspot

  ┌─────────────────────────────────────────────────────────────┐
  │ 1. INPUT                                                    │
  │    Receive brief data (company info, stakeholders, notes)   │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. HUBSPOT: Create/Update Company                           │
  │    • Check if company exists (by domain)                    │
  │    • Create or update with enriched data                    │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. HUBSPOT: Create Contacts                                 │
  │    • Create contacts for key stakeholders                   │
  │    • Associate with company                                 │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. HUBSPOT: Add Note                                        │
  │    • Attach sustainability brief as note on company         │
  │    • Include talking points, ICP score, context             │
  └─────────────────────────┬───────────────────────────────────┘
                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. OUTPUT                                                   │
  │    Return success + HubSpot company URL                     │
  └─────────────────────────────────────────────────────────────┘

  ---
  Dashboard UI Design

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ ┌──────────┐                                                             │
  │ │          │  Sustainability Account Brief Generator                     │
  │ │   LOGO   │  ─────────────────────────────────────────────────────────  │
  │ │          │  ┌─────────────────────────────────────┐  ┌──────────────┐  │
  │ └──────────┘  │ Enter company domain...             │  │  Generate    │  │
  │               └─────────────────────────────────────┘  └──────────────┘  │
  │  ┌─────────┐                                                             │
  │  │         │ ────────────────────────────────────────────────────────────│
  │  │   New   │                                                             │
  │  │  Brief  │  ┌─────────────────────────┐  ┌──────────────────────────┐  │
  │  │         │  │      ICP FIT SCORE      │  │     COMPANY OVERVIEW     │  │
  │  ├─────────┤  │                         │  │                          │  │
  │  │         │  │         85/100          │  │  Patagonia, Inc.         │  │
  │  │ History │  │    ████████████░░░      │  │  Industry: Retail/Apparel│  │
  │  │ (future)│  │                         │  │  Size: 1,000-5,000       │  │
  │  │         │  │  "Strong fit: Public    │  │  HQ: Ventura, CA         │  │
  │  ├─────────┤  │   sustainability goals, │  │  Funding: Private        │  │
  │  │         │  │   enterprise scale,     │  │                          │  │
  │  │Settings │  │   climate-first brand"  │  │                          │  │
  │  │ (future)│  │                         │  │                          │  │
  │  │         │  └─────────────────────────┘  └──────────────────────────┘  │
  │  └─────────┘                                                             │
  │             ┌────────────────────────────────────────────────────────┐   │
  │             │              SUSTAINABILITY SIGNALS                    │   │
  │             │                                                        │   │
  │             │  • Net-zero commitment by 2040                         │   │
  │             │  • 100% renewable energy in operations (achieved 2023) │   │
  │             │  • Published annual ESG report since 2019              │   │
  │             │  • Hired new VP of Environmental Impact (March 2024)   │   │
  │             │  • Member of Climate Pledge                            │   │
  │             │                                                        │   │
  │             └────────────────────────────────────────────────────────┘   │
  │                                                                          │
  │             ┌────────────────────────────────────────────────────────┐   │
  │             │                KEY STAKEHOLDERS                        │   │
  │             │                                                        │   │
  │             │  ┌──────┐  Beth Thoren                                 │   │
  │             │  │ IMG  │  Chief Environmental Officer                 │   │
  │             │  └──────┘  linkedin.com/in/beth-thoren                 │   │
  │             │                                                        │   │
  │             │  ┌──────┐  Ryan Gellert                                │   │
  │             │  │ IMG  │  CEO                                         │   │
  │             │  └──────┘  linkedin.com/in/ryangellert                 │   │
  │             │                                                        │   │
  │             │  ┌──────┐  Michelle Schwab                             │   │
  │             │  │ IMG  │  VP Finance                                  │   │
  │             │  └──────┘  linkedin.com/in/michelle-schwab             │   │
  │             │                                                        │   │
  │             └────────────────────────────────────────────────────────┘   │
  │                                                                          │
  │             ┌────────────────────────────────────────────────────────┐   │
  │             │                 TALKING POINTS                         │   │
  │             │                                                        │   │
  │             │  1. Reference their 2040 net-zero commitment —         │   │
  │             │     ask how they're currently tracking carbon offsets  │   │
  │             │                                                        │   │
  │             │  2. Their new VP of Environmental Impact may be        │   │
  │             │     evaluating carbon accounting tools                 │   │
  │             │                                                        │   │
  │             │  3. As Climate Pledge members, they likely need        │   │
  │             │     verified carbon credits — Patch's marketplace      │   │
  │             │     aligns with their verification standards           │   │
  │             │                                                        │   │
  │             │  4. ESG reporting requirements are increasing —        │   │
  │             │     Patch can streamline their carbon data pipeline    │   │
  │             │                                                        │   │
  │             └────────────────────────────────────────────────────────┘   │
  │                                                                          │
  │             ┌────────────────────────────────────────────────────────┐   │
  │             │                                                        │   │
  │             │                  [ Push to HubSpot ]                   │   │
  │             │                                                        │   │
  │             └────────────────────────────────────────────────────────┘   │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ---
  UI Components (shadcn/ui)

  | Section                | Components               |
  |------------------------|--------------------------|
  | Sidebar                | Custom nav with icons    |
  | Search input           | Input + Button           |
  | ICP Score              | Card + Progress bar      |
  | Company Overview       | Card with Badge tags     |
  | Sustainability Signals | Card with bullet list    |
  | Stakeholders           | Card with Avatar + links |
  | Talking Points         | Card with numbered list  |
  | HubSpot button         | Button (primary)         |
  | Loading state          | Skeleton components      |

  ---
  Environment Variables

  # Clay
  CLAY_API_KEY=xxx

  # Tavily
  TAVILY_API_KEY=xxx

  # OpenAI
  OPENAI_API_KEY=xxx

  # HubSpot
  HUBSPOT_ACCESS_TOKEN=xxx

  ---
  Pre-Build Checklist

  - Create OpenAI API account → Get API key
  - Get Clay API key from account settings
  - Create Tavily account → Get API key
  - Create HubSpot private app → Get access token
  - Set up Vercel project (can do during build)

  ---
  Future Enhancements (Post-MVP)

  - Save brief history (add database)
  - PDF export
  - Batch processing (multiple domains)
  - ICP scoring customization
  - Zapier integration for triggers
  - Gong call context integration

---
## Implementation Plan (Piecemeal Build)

We build in phases, each deployable and testable independently.

### Phase 1: UI Foundation with Mock Data
**Goal:** Build the complete dashboard UI using hardcoded data so we can see and iterate on the design.

- [x] Install shadcn/ui and required components (Card, Button, Input, Progress, Avatar, Skeleton, Badge)
- [x] Create the dashboard layout with sidebar
- [x] Build the domain input form (non-functional)
- [x] Create all result display components with mock Patagonia data:
  - ICP Score card with progress bar
  - Company Overview card
  - Sustainability Signals card
  - Key Stakeholders card
  - Talking Points card
- [x] Add "Push to HubSpot" button (non-functional)
- [x] Add loading skeleton states

**Test:** Visual inspection at localhost:3000 and deployed Vercel URL

---

### Phase 2: Tavily Integration (Sustainability Search)
**Goal:** First real API - fetch sustainability signals for any domain.

- [x] Create `/api/search-sustainability` endpoint
- [x] Integrate Tavily API with two queries:
  - `site:{domain} sustainability ESG carbon`
  - `{company name} sustainability news 2024 2025`
- [x] Add TAVILY_API_KEY to .env.local and Vercel
- [x] Connect frontend form to call this endpoint
- [x] Display Tavily results in new TavilyResultsCard component

**Test:** Enter "patagonia.com" → see real sustainability data appear

---

### Phase 3: OpenAI Integration (Brief Generation)
**Goal:** Transform raw data into a structured, useful brief.

- [ ] Create `/api/generate-brief` endpoint (partial - just Tavily + OpenAI)
- [ ] Design the OpenAI prompt for brief generation
- [ ] Add OPENAI_API_KEY to .env.local and Vercel
- [ ] Return structured JSON: summary, ICP score, sustainability signals, talking points
- [ ] Update frontend to display AI-generated content in all cards
- [ ] Add proper loading states during generation

**Test:** Enter domain → see AI-generated brief with ICP score and talking points

---

### Phase 4: Clay Integration (Company & People Data)
**Goal:** Add firmographics and stakeholder data for complete briefs.

- [ ] Add Clay API client for company enrichment
- [ ] Add Clay API client for people search (by title filters)
- [ ] Add CLAY_API_KEY to .env.local and Vercel
- [ ] Update `/api/generate-brief` to orchestrate: Clay → Tavily → OpenAI
- [ ] Pass all enriched data to OpenAI for better brief generation
- [ ] Display Company Overview with real firmographics
- [ ] Display Key Stakeholders with LinkedIn URLs

**Test:** Enter domain → see complete brief with company data + stakeholders + sustainability + talking points

---

### Phase 5: HubSpot Integration (CRM Push)
**Goal:** One-click push to HubSpot CRM.

- [ ] Create HubSpot private app and get access token
- [ ] Create `/api/push-hubspot` endpoint
- [ ] Implement company create/update (by domain lookup)
- [ ] Implement contact creation for stakeholders
- [ ] Implement note attachment with brief content
- [ ] Add HUBSPOT_ACCESS_TOKEN to .env.local and Vercel
- [ ] Connect "Push to HubSpot" button to endpoint
- [ ] Show success state with link to HubSpot company record

**Test:** Generate brief → click Push to HubSpot → verify data appears in HubSpot CRM

---

### Current Status
- [x] Phase 0: Hello world app deployed to Vercel
- [x] Phase 1: UI Foundation (COMPLETE)
- [x] Phase 2: Tavily Integration (COMPLETE)
- [ ] Phase 3: OpenAI Integration
- [ ] Phase 4: Clay Integration
- [ ] Phase 5: HubSpot Integration

---