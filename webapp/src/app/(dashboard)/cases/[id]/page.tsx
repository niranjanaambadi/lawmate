// src/app/(dashboard)/cases/[id]/page.tsx
"use client"

import { useCase } from "@/lib/hooks/useCases"
import { useDocuments } from "@/lib/hooks/useDocuments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseNumber } from "@/components/shared/CaseNumber"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { CaseOverview } from "@/components/cases/CaseOverview"
import { CaseTimeline } from "@/components/cases/CaseTimeline"
import { CaseDocuments } from "@/components/cases/CaseDocuments"
import { CaseAnalysis } from "@/components/cases/CaseAnalysis"
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  Trash2,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDeleteCase } from "@/lib/hooks/useCases"
import { toast } from "sonner"

export default function CaseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { data: caseData, isLoading } = useCase(params.id)
  const { data: documents } = useDocuments(params.id)
  const { mutate: deleteCase, isPending: isDeleting } = useDeleteCase()

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this case? This action cannot be undone."
      )
    ) {
      deleteCase(params.id, {
        onSuccess: () => {
          toast.success("Case deleted successfully")
          router.push("/cases")
        },
        onError: () => {
          toast.error("Failed to delete case")
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-20 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-40 w-full" />
        </div>
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Case not found
          </h2>
          <p className="text-slate-600 mb-4">
            The case you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/cases">
            <Button>Back to Cases</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link
          href="/cases"
          className="hover:text-indigo-600 transition-colors"
        >
          Cases
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">
          {caseData.caseNumber || caseData.efilingNumber}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link href="/cases">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Button>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <CaseNumber
              caseNumber={caseData.caseNumber || caseData.efilingNumber}
            />
            <StatusBadge status={caseData.status} />
            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700">
              {caseData.caseType}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {caseData.petitionerName} vs {caseData.respondentName}
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              Filed: {new Date(caseData.efilingDate).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>Type: {caseData.caseType}</span>
            <span>•</span>
            <span>Year: {caseData.caseYear}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Case
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Case"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Documents</div>
            <div className="text-2xl font-bold text-slate-900">
              {documents?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Next Hearing</div>
            <div className="text-2xl font-bold text-slate-900">
              {caseData.nextHearingDate
                ? new Date(caseData.nextHearingDate).toLocaleDateString(
                    "en-IN",
                    { month: "short", day: "numeric" }
                  )
                : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Judge</div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {caseData.judgeName || "Not assigned"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Court</div>
            <div className="text-2xl font-bold text-slate-900">
              {caseData.courtNumber || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({documents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CaseOverview case={caseData} />
        </TabsContent>

        <TabsContent value="documents">
          <CaseDocuments caseId={params.id} />
        </TabsContent>

        <TabsContent value="timeline">
          <CaseTimeline caseId={params.id} />
        </TabsContent>

        <TabsContent value="analysis">
          <CaseAnalysis caseId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
