"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TavilyResultsCard({ results, siteAnswer, newsAnswer }) {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No sustainability information found for this domain.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Sustainability Search Results
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {results.length} sources found
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        {(siteAnswer || newsAnswer) && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              AI Summary
            </p>
            {siteAnswer && (
              <p className="text-sm mb-2">{siteAnswer}</p>
            )}
            {newsAnswer && newsAnswer !== siteAnswer && (
              <p className="text-sm text-muted-foreground">{newsAnswer}</p>
            )}
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-3">
          {results.slice(0, 6).map((result, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium line-clamp-1 hover:text-primary">
                    {result.title}
                  </h4>
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {result.content}
                </p>
                <p className="text-xs text-primary/70 truncate">
                  {new URL(result.url).hostname}
                </p>
              </a>
            </div>
          ))}
        </div>

        {results.length > 6 && (
          <p className="text-xs text-muted-foreground text-center">
            + {results.length - 6} more results
          </p>
        )}
      </CardContent>
    </Card>
  );
}
