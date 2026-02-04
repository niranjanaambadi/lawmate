"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUpcomingHearings } from "@/lib/hooks/useCases"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate, getDaysUntil } from "@/lib/utils/date"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: hearings, isLoading } = useUpcomingHearings(30)

  // Get month and year
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Generate calendar days
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  // Get hearings for a specific day
  const getHearingsForDay = (day: number) => {
    if (!hearings) return []
    
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    
    return hearings.filter(hearing => {
      if (!hearing.next_hearing_date) return false
      const hearingDate = hearing.next_hearing_date.split('T')[0]
      return hearingDate === dateStr
    })
  }

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Calendar
          </h1>
          <p className="text-slate-600 mt-1">
            View all upcoming hearings in calendar view
          </p>
        </div>
        <Button onClick={goToToday} variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Today
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-slate-600 uppercase py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />
                }

                const dayHearings = getHearingsForDay(day)
                const isToday = 
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear()

                return (
                  <div
                    key={day}
                    className={cn(
                      "relative min-h-[80px] rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors",
                      isToday && "bg-indigo-50 border-indigo-300"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium",
                      isToday ? "text-indigo-600" : "text-slate-900"
                    )}>
                      {day}
                    </div>
                    
                    {dayHearings.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayHearings.slice(0, 2).map(hearing => (
                          <Link
                            key={hearing.id}
                            href={`/cases/${hearing.id}`}
                            className="block"
                          >
                            <div className="rounded bg-indigo-100 px-1 py-0.5 text-xs text-indigo-700 truncate hover:bg-indigo-200 transition-colors">
                              {hearing.case_number || hearing.efiling_number}
                            </div>
                          </Link>
                        ))}
                        {dayHearings.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{dayHearings.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Hearings List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Hearings</CardTitle>
          </CardHeader>
          <CardContent>
            {!hearings || hearings.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="h-8 w-8 text-slate-400" />}
                title="No hearings"
                message="No hearings scheduled in the next 30 days"
              />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {hearings.map(hearing => {
                  const daysUntil = getDaysUntil(hearing.next_hearing_date!)
                  const isUrgent = daysUntil <= 2

                  return (
                    <Link
                      key={hearing.id}
                      href={`/cases/${hearing.id}`}
                      className="block"
                    >
                      <div className={cn(
                        "rounded-lg border border-slate-200 p-3 hover:shadow-md transition-all",
                        isUrgent && "border-amber-300 bg-amber-50"
                      )}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                            {hearing.case_number || hearing.efiling_number}
                          </code>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-slate-900 font-medium mb-1 line-clamp-1">
                          {hearing.petitioner_name} vs {hearing.respondent_name}
                        </div>
                        
                        <div className="text-xs text-slate-600">
                          {formatDate(hearing.next_hearing_date!, 'PPP')}
                        </div>
                        
                        <div className="text-xs text-slate-500 mt-1">
                          {daysUntil === 0 && "Today"}
                          {daysUntil === 1 && "Tomorrow"}
                          {daysUntil > 1 && `In ${daysUntil} days`}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}