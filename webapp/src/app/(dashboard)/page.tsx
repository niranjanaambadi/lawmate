"use client"

import { StatCard } from "@/components/dashboard/StatCard"
import { UpcomingHearings } from "@/components/dashboard/UpcomingHearings"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { CaseTable } from "@/components/cases/CaseTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCaseStats } from "@/lib/hooks/useCases"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import {
  FolderOpen,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function DashboardPage() {
  const { data: stats, isLoading } = useCaseStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's an overview of your cases.
          </p>
        </div>
        <Link href="/cases/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cases"
          value={stats?.total_cases || 0}
          change={12}
          trend="up"
          icon={FolderOpen}
          description="Active and closed cases"
        />
        <StatCard
          title="Pending Cases"
          value={stats?.pending_cases || 0}
          change={-5}
          trend="down"
          icon={Clock}
          description="Awaiting hearings"
        />
        <StatCard
          title="Upcoming Hearings"
          value={stats?.upcoming_hearings || 0}
          change={0}
          trend="neutral"
          icon={Calendar}
          description="Next 7 days"
        />
        <StatCard
          title="Total Documents"
          value={stats?.total_documents || 0}
          change={23}
          trend="up"
          icon={FileText}
          description="PDFs and annexures"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Case Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Case Filing Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.monthly_trend || []}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCases)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.cases_by_status && (
                <>
                  <StatusBar
                    label="Pending"
                    count={stats.cases_by_status.pending || 0}
                    total={stats.total_cases}
                    color="bg-amber-500"
                    icon={AlertTriangle}
                  />
                  <StatusBar
                    label="Registered"
                    count={stats.cases_by_status.registered || 0}
                    total={stats.total_cases}
                    color="bg-blue-500"
                    icon={FileText}
                  />
                  <StatusBar
                    label="Filed"
                    count={stats.cases_by_status.filed || 0}
                    total={stats.total_cases}
                    color="bg-indigo-500"
                    icon={FolderOpen}
                  />
                  <StatusBar
                    label="Disposed"
                    count={stats.cases_by_status.disposed || 0}
                    total={stats.total_cases}
                    color="bg-emerald-500"
                    icon={CheckCircle2}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Cases</CardTitle>
              <Link href="/cases">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="disposed">Disposed</TabsTrigger>
                </TabsList>
               <TabsContent value="active">
  <CaseTable
    filters={{
      status: "registered",
      sort: "updated_at",
      order: "desc",
      per_page: 5,
    }}
  />
</TabsContent>
<TabsContent value="pending">
  <CaseTable
    filters={{
      status: "pending",
      sort: "next_hearing_date",
      order: "asc",
      per_page: 5,
    }}
  />
</TabsContent>
<TabsContent value="disposed">
  <CaseTable
    filters={{
      status: "disposed",
      sort: "updated_at",
      order: "desc",
      per_page: 5,
    }}
  />
</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Takes 1 column */}
        <div className="space-y-6">
          <UpcomingHearings />
          <ActivityFeed />
        </div>
      </div>

      {/* Case Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Case Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.cases_by_type &&
              Object.entries(stats.cases_by_type).map(([type, count]) => (
                <div
                  key={type}
                  className="rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {count}
                  </div>
                  <div className="text-sm text-slate-600">{type}</div>
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{
                        width: `${(count / stats.total_cases) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/search">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-bold text-slate-900 mb-1">
                    Search Cases
                  </div>
                  <div className="text-xs text-slate-600">
                    Find cases by number, party name, or keywords
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-bold text-slate-900 mb-1">
                    View Calendar
                  </div>
                  <div className="text-xs text-slate-600">
                    See all upcoming hearings in calendar view
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/documents">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-bold text-slate-900 mb-1">
                    Browse Documents
                  </div>
                  <div className="text-xs text-slate-600">
                    Access all case documents and PDFs
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for status bars
function StatusBar({
  label,
  count,
  total,
  color,
  icon: Icon,
}: {
  label: string
  count: number
  total: number
  color: string
  icon: any
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">{count}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-slate-600 mt-1">
        {percentage.toFixed(1)}% of total cases
      </div>
    </div>
  )
}