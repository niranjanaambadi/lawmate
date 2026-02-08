// src/app/(dashboard)/cases/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Case } from '@/types/case'
import { Loader2, FileText, Calendar, AlertCircle, Scale, Brain } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadCaseDetails()
  }, [caseId])

  const loadCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`)
      const data = await response.json()
      setCaseData(data.case)
    } catch (error) {
      console.error('Failed to load case:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The case you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/cases">
              <Button>Back to Cases</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              {caseData.caseNumber || caseData.efilingNumber}
            </h1>
            <p className="text-muted-foreground">
              {caseData.caseType} - {caseData.caseYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={
              caseData.status === 'PENDING' ? 'default' :
              caseData.status === 'DISPOSED' ? 'secondary' :
              'outline'
            }>
              {caseData.status}
            </Badge>
            <Link href={`/cases/${caseId}/ai-insights`}>
              <Button variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                AI Insights
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">
                    {caseData._count?.documents || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Hearing</p>
                  <p className="text-lg font-semibold">
                    {caseData.nextHearingDate
                      ? format(new Date(caseData.nextHearingDate), 'MMM d, yyyy')
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="text-lg font-semibold">
                    {caseData.courtNumber || 'Not assigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Judge</p>
                <p className="text-lg font-semibold">
                  {caseData.judgeName || 'Not assigned'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CaseOverview caseData={caseData} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsList caseId={caseId} />
        </TabsContent>

        <TabsContent value="history">
          <CaseHistoryList caseId={caseId} />
        </TabsContent>

        <TabsContent value="ai-analysis">
          <AIAnalysisSection caseId={caseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Component Props Interfaces
interface CaseOverviewProps {
  caseData: Case
}

function CaseOverview({ caseData }: CaseOverviewProps) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Case Number</p>
              <p className="text-base">{caseData.caseNumber || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-Filing Number</p>
              <p className="text-base">{caseData.efilingNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Case Type</p>
              <p className="text-base">{caseData.caseType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Filing Date</p>
              <p className="text-base">
                {format(new Date(caseData.efilingDate), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Party Role</p>
              <p className="text-base capitalize">{caseData.partyRole}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bench Type</p>
              <p className="text-base">{caseData.benchType || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Petitioner</p>
            <p className="text-base">{caseData.petitionerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Respondent</p>
            <p className="text-base">{caseData.respondentName}</p>
          </div>
        </CardContent>
      </Card>

      {caseData.efilingDetails && (
        <Card>
          <CardHeader>
            <CardTitle>E-Filing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{caseData.efilingDetails}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DocumentsList({ caseId }: { caseId: string }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [caseId])

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/documents`)
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Documents</h3>
          <p className="text-muted-foreground">No documents have been uploaded for this case.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {doc.category} • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{doc.uploadStatus}</Badge>
                <Link href={`/documents/${doc.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CaseHistoryList({ caseId }: { caseId: string }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [caseId])

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/history`)
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No History</h3>
          <p className="text-muted-foreground">No events have been recorded for this case.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((event) => (
        <Card key={event.id}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{event.eventType}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(event.eventDate), 'MMMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm">{event.businessRecorded}</p>
                {event.judgeName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Judge: {event.judgeName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AIAnalysisSection({ caseId }: { caseId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          View comprehensive AI-powered insights for this case
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">AI Insights Available</h3>
          <p className="text-muted-foreground mb-4">
            Get detailed analysis including precedents, risk assessment, and more
          </p>
          <Link href={`/cases/${caseId}/ai-insights`}>
            <Button>
              <Brain className="mr-2 h-4 w-4" />
              View AI Insights
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}