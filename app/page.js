"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IcpScoreCard,
  CompanyOverviewCard,
  SustainabilitySignalsCard,
  StakeholdersCard,
  TalkingPointsCard,
  BriefSkeleton,
} from "@/components/brief";
import { TavilyResultsCard } from "@/components/brief/tavily-results-card";

export default function Dashboard() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [briefData, setBriefData] = useState(null);
  const [tavilyData, setTavilyData] = useState(null);
  const [error, setError] = useState(null);
  const [isPushingToHubSpot, setIsPushingToHubSpot] = useState(false);
  const [hubspotResult, setHubspotResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsLoading(true);
    setBriefData(null);
    setTavilyData(null);
    setError(null);
    setHubspotResult(null);

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate brief");
      }

      // Store AI-generated brief data (all real data now!)
      setBriefData({
        company: data.company,
        icpScore: data.icpScore,
        sustainabilitySignals: data.sustainabilitySignals,
        stakeholders: data.stakeholders,
        stakeholderSource: data.stakeholderSource,
        talkingPoints: data.talkingPoints,
      });

      // Store search results for reference
      setTavilyData({
        companyName: data.companyName,
        domain: data.domain,
        results: data.searchResults,
        totalResults: data.totalSearchResults,
      });
    } catch (err) {
      setError(err.message);
      console.error("Generate brief error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setDomain("patagonia.com");
    setIsLoading(true);
    setBriefData(null);
    setTavilyData(null);
    setError(null);
    setHubspotResult(null);

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: "patagonia.com" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate brief");
      }

      setBriefData({
        company: data.company,
        icpScore: data.icpScore,
        sustainabilitySignals: data.sustainabilitySignals,
        stakeholders: data.stakeholders,
        stakeholderSource: data.stakeholderSource,
        talkingPoints: data.talkingPoints,
      });

      setTavilyData({
        companyName: data.companyName,
        domain: data.domain,
        results: data.searchResults,
        totalResults: data.totalSearchResults,
      });
    } catch (err) {
      setError(err.message);
      console.error("Generate brief error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToHubSpot = async () => {
    if (!briefData || !tavilyData) return;

    setIsPushingToHubSpot(true);
    setHubspotResult(null);

    try {
      const response = await fetch("/api/push-hubspot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: tavilyData.domain,
          company: briefData.company,
          icpScore: briefData.icpScore,
          sustainabilitySignals: briefData.sustainabilitySignals,
          stakeholders: briefData.stakeholders,
          talkingPoints: briefData.talkingPoints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to push to HubSpot");
      }

      setHubspotResult({
        success: true,
        hubspotUrl: data.hubspotUrl,
        companyCreated: data.companyCreated,
        contactsCreated: data.contactsCreated,
        contactsSkipped: data.contactsSkipped,
      });
    } catch (err) {
      setHubspotResult({
        success: false,
        error: err.message,
      });
      console.error("Push to HubSpot error:", err);
    } finally {
      setIsPushingToHubSpot(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Sustainability Account Brief Generator
            </h1>
            <p className="text-muted-foreground">
              Enter a company domain to generate an AI-powered account brief
              with sustainability insights.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleGenerate} className="mb-8">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter company domain (e.g., patagonia.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !domain.trim()}>
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Brief"
                )}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Demo Button - show only when no data */}
          {!briefData && !isLoading && !error && (
            <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground mb-3">
                Want to see a demo? Click below to generate a sample brief for
                Patagonia.
              </p>
              <Button variant="outline" onClick={handleDemoClick}>
                Try Demo with Patagonia
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <BriefSkeleton />}

          {/* Brief Results */}
          {briefData && !isLoading && (
            <div className="space-y-6">
              {/* Top row - ICP Score and Company Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IcpScoreCard
                  score={briefData.icpScore.score}
                  reasoning={briefData.icpScore.reasoning}
                />
                <CompanyOverviewCard company={briefData.company} />
              </div>

              {/* Tavily Search Results */}
              {tavilyData && (
                <TavilyResultsCard
                  results={tavilyData.results}
                  siteAnswer={tavilyData.siteSearchAnswer}
                  newsAnswer={tavilyData.newsSearchAnswer}
                />
              )}

              {/* Sustainability Signals */}
              <SustainabilitySignalsCard signals={briefData.sustainabilitySignals} />

              {/* Stakeholders - Now with real data! */}
              <StakeholdersCard stakeholders={briefData.stakeholders} source={briefData.stakeholderSource} />

              {/* Talking Points */}
              <TalkingPointsCard talkingPoints={briefData.talkingPoints} />

              {/* Push to HubSpot Button */}
              <div className="pt-4 space-y-3">
                {/* Success Message */}
                {hubspotResult?.success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Successfully pushed to HubSpot!
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      {hubspotResult.companyCreated ? "Created new company" : "Updated existing company"}
                      {hubspotResult.contactsCreated > 0 && ` and ${hubspotResult.contactsCreated} contact(s)`}
                    </p>
                    <a
                      href={hubspotResult.hubspotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-green-800 hover:text-green-900 font-medium"
                    >
                      View in HubSpot
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Error Message */}
                {hubspotResult?.success === false && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{hubspotResult.error}</p>
                  </div>
                )}

                {/* Push Button */}
                <Button
                  onClick={handlePushToHubSpot}
                  className="w-full"
                  size="lg"
                  disabled={isPushingToHubSpot}
                >
                  {isPushingToHubSpot ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Pushing to HubSpot...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984 2.21 2.21 0 00-4.42 0c0 .873.507 1.627 1.243 1.984V7.93a5.549 5.549 0 00-3.109 1.556l-6.6-5.14a2.765 2.765 0 00.096-.71 2.772 2.772 0 10-2.772 2.773c.57 0 1.096-.177 1.533-.476l6.462 5.032a5.578 5.578 0 00-.376 2.018c0 .744.145 1.454.408 2.104l-2.072 1.2a2.195 2.195 0 00-1.921-1.128 2.21 2.21 0 102.21 2.21 2.19 2.19 0 00-.258-1.027l2.084-1.207a5.577 5.577 0 109.225-7.22zm-2.905 8.57a3.35 3.35 0 110-6.7 3.35 3.35 0 010 6.7z" />
                      </svg>
                      {hubspotResult?.success ? "Push Again" : "Push to HubSpot"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
