"use client";

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { GitCommit, GitPullRequest, MessageSquare, GitBranch } from "lucide-react"
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getMonthlyActivity } from '@/module/dashboard/actions';
import ContributionGraph from '@/module/dashboard/components/contributions-graph';
import { Spinner } from '@/components/ui/spinner';

const MainPage = () => {

  const {data: stats, isLoading} = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  })

  const {data: monthlyActivity, isLoading: isLoadingActivity} = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
  })



  return (
    <div className="space-y-6">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your coding activity and AI reviews</p>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
            <div className="rounded-md bg-primary/10 p-2">
              <GitBranch className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalRepos || 0}</div>
            <p className="text-xs text-muted-foreground">Connected repositories</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <div className="rounded-md bg-blue-500/10 p-2">
              <GitCommit className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : (stats?.totalCommits || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In the last year</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all hover:border-violet-500/40 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
            <div className="rounded-md bg-violet-500/10 p-2">
              <GitPullRequest className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalPRs || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Reviews</CardTitle>
            <div className="rounded-md bg-emerald-500/10 p-2">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">Generated reviews</p>
          </CardContent>
        </Card>
      </div>

     {/* calendar */}

      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Visualizing your coding frequency over the last year</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ContributionGraph />
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='col-span-2 border-border/60 bg-card/95 shadow-sm'>
          <CardHeader className="border-b border-border/50">
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Monthly breakdown of commits, PRs, and reviews (last 6 months)</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoadingActivity ? (
              <div className="h-80 w-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className='h-80 w-full'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                  <BarChart data={monthlyActivity || []} barGap={8} barCategoryGap="24%" margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.18 }}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: 8,
                        boxShadow: 'var(--shadow-md)',
                      }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                    <Bar dataKey="commits" name="Commits" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={56} />
                    <Bar dataKey="prs" name="Pull Requests" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={56} />
                    <Bar dataKey="reviews" name="AI Reviews" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

export default MainPage
