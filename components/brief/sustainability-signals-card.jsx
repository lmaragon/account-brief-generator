"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SustainabilitySignalsCard({ signals }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Sustainability Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {signals.map((signal, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-green-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
