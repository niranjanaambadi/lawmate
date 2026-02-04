import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Case } from "@/types/case"
import { formatDate } from "@/lib/utils/date"
import {
  User,
  Calendar,
  MapPin,
  FileText,
  Scale,
  Clock,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CaseOverviewProps {
  case: Case
}

export function CaseOverview({ case: caseData }: CaseOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Party Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Party Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">
              Petitioner
            </div>
            <div className="font-bold text-slate-900">
              {caseData.petitioner_name}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Role: {caseData.party_role}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Respondent
            </div>
            <div className="font-bold text-slate-900">
              {caseData.respondent_name}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-600" />
            Case Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">E-filing Number</div>
            <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
              {caseData.efiling_number}
            </code>
          </div>

          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Case Number</div>
            <div className="font-medium text-slate-900">
              {caseData.case_number || "Not assigned"}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Case Type</div>
            <div className="font-medium text-slate-900">
              {caseData.case_type}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Case Year</div>
            <div className="font-medium text-slate-900">
              {caseData.case_year}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Filing Date</div>
            <div className="font-medium text-slate-900">
              {formatDate(caseData.efiling_date, "PPP")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Court Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            Court Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Judge</div>
            <div className="font-medium text-slate-900 text-right max-w-xs">
              {caseData.judge_name || "Not assigned"}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Bench Type</div>
            <div className="font-medium text-slate-900">
              {caseData.bench_type || "—"}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="text-sm text-slate-600">Court Number</div>
            <div className="font-medium text-slate-900">
              {caseData.court_number || "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hearing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Hearing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.next_hearing_date ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
                <div className="text-sm text-indigo-600 mb-1">
                  Next Hearing Date
                </div>
                <div className="text-2xl font-bold text-indigo-900 mb-1">
                  {formatDate(caseData.next_hearing_date, "PP")}
                </div>
                <div className="text-sm text-indigo-700">
                  {formatDate(caseData.next_hearing_date, "p")}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.ceil(
                    (new Date(caseData.next_hearing_date).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days remaining
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No hearing scheduled yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filing Details */}
      {caseData.efiling_details && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Filing Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {caseData.efiling_details}
            </p>
          </CardContent>
        </Card>
      )}

      {/* KHC Portal Link */}
      {caseData.khc_source_url && (
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 mb-1">
                  View on KHC Portal
                </div>
                <div className="text-sm text-slate-600">
                  Access the original case on Kerala High Court e-filing portal
                </div>
              </div>
              <a
                href={caseData.khc_source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  Open Portal
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}