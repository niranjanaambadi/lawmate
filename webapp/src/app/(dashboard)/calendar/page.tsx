// src/app/(dashboard)/calendar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { Case } from '@/types/case'
import { Clock, MapPin, User } from 'lucide-react'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [hearings, setHearings] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHearings()
  }, [])

  const fetchHearings = async () => {
    try {
      const response = await fetch('/api/cases?status=PENDING')
      const data = await response.json()
      setHearings(data.cases || [])
    } catch (error) {
      console.error('Failed to fetch hearings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHearingsForDate = (selectedDate: Date | undefined): Case[] => {
    if (!selectedDate) return []
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    return hearings.filter(hearing => {
      if (!hearing.nextHearingDate) return false
      
      // Handle both Date objects and ISO strings
      const hearingDateStr = hearing.nextHearingDate instanceof Date
        ? format(hearing.nextHearingDate, 'yyyy-MM-dd')
        : format(parseISO(hearing.nextHearingDate as string), 'yyyy-MM-dd')
      
      return hearingDateStr === dateStr
    })
  }

  const selectedDateHearings = getHearingsForDate(date)

  // Get dates that have hearings for calendar highlighting
  const datesWithHearings = hearings
    .filter(h => h.nextHearingDate)
    .map(h => {
      const hearingDate = h.nextHearingDate instanceof Date
        ? h.nextHearingDate
        : parseISO(h.nextHearingDate as string)
      return format(hearingDate, 'yyyy-MM-dd')
    })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hearing Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming court hearings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>
              Click on a date to view hearings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                hasHearing: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return datesWithHearings.includes(dateStr)
                }
              }}
              modifiersStyles={{
                hasHearing: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '0.25rem'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Hearings List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDateHearings.length === 0
                ? 'No hearings scheduled'
                : `${selectedDateHearings.length} hearing${selectedDateHearings.length > 1 ? 's' : ''} scheduled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading hearings...
              </div>
            ) : selectedDateHearings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hearings on this date
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateHearings.map((hearing) => (
                  <HearingCard key={hearing.id} hearing={hearing} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Hearings Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
          <CardDescription>
            Next 7 days schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpcomingHearingsList hearings={hearings} />
        </CardContent>
      </Card>
    </div>
  )
}

function HearingCard({ hearing }: { hearing: Case }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-accent transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">{hearing.caseNumber || hearing.efilingNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {hearing.caseType}
          </p>
        </div>
        <Badge variant={hearing.status === 'PENDING' ? 'default' : 'secondary'}>
          {hearing.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Petitioner:</span>
          <span className="text-muted-foreground">{hearing.petitionerName}</span>
        </div>

        {hearing.judgeName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Judge:</span>
            <span className="text-muted-foreground">{hearing.judgeName}</span>
          </div>
        )}

        {hearing.courtNumber && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Court:</span>
            <span className="text-muted-foreground">{hearing.courtNumber}</span>
          </div>
        )}

        {hearing.benchType && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Bench:</span>
            <span className="text-muted-foreground">{hearing.benchType}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function UpcomingHearingsList({ hearings }: { hearings: Case[] }) {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const upcomingHearings = hearings
    .filter(h => {
      if (!h.nextHearingDate) return false
      const hearingDate = h.nextHearingDate instanceof Date
        ? h.nextHearingDate
        : parseISO(h.nextHearingDate as string)
      return hearingDate >= today && hearingDate <= nextWeek
    })
    .sort((a, b) => {
      const dateA = a.nextHearingDate instanceof Date
        ? a.nextHearingDate
        : parseISO(a.nextHearingDate as string)
      const dateB = b.nextHearingDate instanceof Date
        ? b.nextHearingDate
        : parseISO(b.nextHearingDate as string)
      return dateA.getTime() - dateB.getTime()
    })

  if (upcomingHearings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hearings scheduled in the next 7 days
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {upcomingHearings.map((hearing) => (
        <div
          key={hearing.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="space-y-1">
            <p className="font-medium">{hearing.caseNumber || hearing.efilingNumber}</p>
            <p className="text-sm text-muted-foreground">{hearing.caseType}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {hearing.nextHearingDate && format(
                hearing.nextHearingDate instanceof Date
                  ? hearing.nextHearingDate
                  : parseISO(hearing.nextHearingDate as string),
                'MMM d, yyyy'
              )}
            </p>
            {hearing.courtNumber && (
              <p className="text-sm text-muted-foreground">{hearing.courtNumber}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
