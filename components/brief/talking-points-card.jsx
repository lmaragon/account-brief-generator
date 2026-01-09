"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TalkingPointsCard({ talkingPoints }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Talking Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {talkingPoints.map((point, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
