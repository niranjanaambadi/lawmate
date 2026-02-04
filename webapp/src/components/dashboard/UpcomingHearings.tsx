import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CaseNumber } from "@/components/shared/CaseNumber"
import { UrgencyBadge } from "@/components/shared/UrgencyBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { useUpcomingHearings } from "@/lib/hooks/useCases"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { formatDate, getDaysUntil } from "@/lib/utils/date"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"

export function UpcomingHearings() {
  const { data: hearings, isLoading } = useUpcomingHearings(7)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hearings || hearings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Calendar className="h-8 w-8 text-slate-400" />}
            title="No upcoming hearings"
            message="You have no hearings scheduled in the next 7 days."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Hearings (Next 7 Days)</CardTitle>
        <Link href="/calendar">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hearings.map((hearing) => {
            const daysUntil = getDaysUntil(hearing.next_hearing_date!)
            const isUrgent = daysUntil <= 2

            return (
              <Link
                key={hearing.id}
                href={`/cases/${hearing.id}`}
                className="block group"
              >
                <div
                  className={cn(
                    "rounded-lg border border-slate-200 p-4 transition-all hover:shadow-md hover:border-indigo-300",
                    isUrgent && "border-amber-300 bg-amber-50/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center rounded-lg bg-indigo-50 px-3 py-2 min-w-[60px] border border-indigo-200">
                      <div className="text-2xl font-bold text-indigo-600">
                        {new Date(hearing.next_hearing_date!).getDate()}
                      </div>
                      <div className="text-xs font-medium text-indigo-600 uppercase">
                        {formatDate(hearing.next_hearing_date!, "MMM")}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CaseNumber caseNumber={hearing.case_number || hearing.efiling_number} />
                        {hearing.ai_analysis?.urgency_level && (
                          <UrgencyBadge
                            level={hearing.ai_analysis.urgency_level}
                            showIcon={false}
                          />
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {hearing.petitioner_name} vs {hearing.respondent_name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(hearing.next_hearing_date!, "p")}</span>
                        </div>
                        {hearing.judge_name && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span className="truncate">{hearing.judge_name}</span>
                          </div>
                        )}
                        {hearing.court_number && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>Court {hearing.court_number}</span>
                          </div>
                        )}
                      </div>

                      {/* Days until hearing */}
                      <div className="mt-2">
                        <span
                          className={cn(
                            "inline-flex items-center text-xs font-medium",
                            isUrgent ? "text-amber-700" : "text-slate-600"
                          )}
                        >
                          {daysUntil === 0 && "Today"}
                          {daysUntil === 1 && "Tomorrow"}
                          {daysUntil > 1 && `In ${daysUntil} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}