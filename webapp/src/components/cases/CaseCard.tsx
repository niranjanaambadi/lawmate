import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CaseNumber } from "@/components/shared/CaseNumber"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { UrgencyBadge } from "@/components/shared/UrgencyBadge"
import type { Case } from "@/types/case"
import { formatDate, getDaysUntil } from "@/lib/utils/date"
import { Calendar, FileText, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"

interface CaseCardProps {
  case: Case
}

export function CaseCard({ case: caseItem }: CaseCardProps) {
  const daysUntilHearing = caseItem.next_hearing_date
    ? getDaysUntil(caseItem.next_hearing_date)
    : null

  const isUrgent =
    daysUntilHearing !== null && daysUntilHearing >= 0 && daysUntilHearing <= 2

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        isUrgent && "border-amber-300 bg-amber-50/30"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CaseNumber
            caseNumber={caseItem.case_number || caseItem.efiling_number}
          />
          <StatusBadge status={caseItem.status} />
        </div>

        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {caseItem.petitioner_name} vs {caseItem.respondent_name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
          <span className="px-2 py-1 rounded bg-slate-100 font-medium">
            {caseItem.case_type}
          </span>
          <span>•</span>
          <span>{caseItem.case_year}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Next Hearing */}
        {caseItem.next_hearing_date ? (
          <div
            className={cn(
              "rounded-lg p-3 border",
              isUrgent
                ? "bg-amber-50 border-amber-200"
                : "bg-slate-50 border-slate-200"
            )}
          >
            <div className="flex items-start gap-2">
              <Calendar
                className={cn(
                  "h-4 w-4 mt-0.5",
                  isUrgent ? "text-amber-700" : "text-slate-600"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-600 mb-1">
                  Next Hearing
                </div>
                <div
                  className={cn(
                    "font-bold text-sm",
                    isUrgent ? "text-amber-900" : "text-slate-900"
                  )}
                >
                  {formatDate(caseItem.next_hearing_date, "PP")}
                </div>
                <div className="text-xs text-slate-600">
                  {formatDate(caseItem.next_hearing_date, "p")}
                </div>
                {daysUntilHearing !== null && (
                  <div
                    className={cn(
                      "text-xs font-medium mt-1",
                      isUrgent ? "text-amber-700" : "text-slate-600"
                    )}
                  >
                    {daysUntilHearing === 0 && "Today"}
                    {daysUntilHearing === 1 && "Tomorrow"}
                    {daysUntilHearing > 1 && `In ${daysUntilHearing} days`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg p-3 border border-slate-200 bg-slate-50 text-center">
            <div className="text-xs text-slate-500">No hearing scheduled</div>
          </div>
        )}

        {/* Judge Info */}
        {caseItem.judge_name && (
          <div className="text-sm">
            <span className="text-slate-600">Judge: </span>
            <span className="font-medium text-slate-900">
              {caseItem.judge_name}
            </span>
          </div>
        )}

        {/* AI Analysis */}
        {caseItem.ai_analysis && (
          <div className="flex items-center justify-between">
            <UrgencyBadge
              level={caseItem.ai_analysis.urgency_level!}
              showIcon={false}
            />
            {caseItem.ai_analysis.case_summary && (
              <div className="text-xs text-slate-600 truncate flex-1 ml-2">
                {caseItem.ai_analysis.case_summary}
              </div>
            )}
          </div>
        )}

        {/* Document Count */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileText className="h-4 w-4" />
          <span>
            {caseItem.documents?.length || 0} document
            {caseItem.documents?.length !== 1 && "s"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-200">
        <Link href={`/cases/${caseItem.id}`} className="w-full">
          <Button variant="outline" className="w-full group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-300 transition-all">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
