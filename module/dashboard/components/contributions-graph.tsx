"use client";

import React from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getContributionStats } from "../actions";

type ContributionGraphData = {
  contributions: Activity[]
  totalContributions: number
}

const ContributionGraph = () => {
  const { theme } = useTheme();

  const { data, isLoading } = useQuery<ContributionGraphData>({
    queryKey: ["contribution-stats"],
    queryFn: async () => {
      const contributions = ((await getContributionStats()) ?? []) as Activity[];

      return {
        contributions,
        totalContributions: contributions.reduce((total, day) => total + day.count, 0),
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-56 w-full flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/20 p-8">
        <div className="animate-pulse text-sm text-muted-foreground">Loading contribution data...</div>
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="flex min-h-56 w-full flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/20 p-8">
        <div className="text-sm text-muted-foreground">No contribution data available</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-md bg-muted/20 p-4">
      <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-sm">
        <span className="font-semibold text-foreground">{data.totalContributions}</span>{" "}
        contributions in the last year
      </div>

      <div className="w-full overflow-x-auto rounded-md border border-border/50 bg-background/40 p-4">
        <div className="flex justify-center min-w-max px-4">
          <ActivityCalendar
            data={data.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={11}
            blockMargin={4}
            fontSize={14}
            showWeekdayLabels
            showMonthLabels
            theme={{
              light: ["hsl(220, 14%, 92%)", "#bbf7d0", "#86efac", "#22c55e", "#15803d"],
              dark: ["#161b22", "#064e3b", "#047857", "#10b981", "#34d399"],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
