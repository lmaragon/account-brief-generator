"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function IcpScoreCard({ score, reasoning }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "[&>div]:bg-green-600";
    if (score >= 60) return "[&>div]:bg-yellow-600";
    return "[&>div]:bg-red-600";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          ICP Fit Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-muted-foreground text-lg">/100</span>
        </div>
        <Progress value={score} className={`h-2 mb-4 ${getProgressColor(score)}`} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          &ldquo;{reasoning}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
}
