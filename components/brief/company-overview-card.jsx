"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CompanyOverviewCard({ company }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-3">{company.name}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Industry</span>
            <Badge variant="secondary">{company.industry}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">{company.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">HQ</span>
            <span className="font-medium">{company.headquarters}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Funding</span>
            <span className="font-medium">{company.funding}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
