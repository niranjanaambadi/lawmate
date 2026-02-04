import type { CaseStatus } from '@/types/case'
import type { UrgencyLevel } from '@/types/analysis'
export function formatCaseStatus(status: CaseStatus): string {
  const statusMap: Record<CaseStatus, string> = {
    filed: 'Filed',
    registered: 'Registered',
    pending: 'Pending',
    disposed: 'Disposed',
    transferred: 'Transferred',
  }
  return statusMap[status] || status
}

export function getStatusColor(status: CaseStatus): string {
  const colorMap: Record<CaseStatus, string> = {
    filed: 'bg-blue-100 text-blue-800',
    registered: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    disposed: 'bg-gray-100 text-gray-800',
    transferred: 'bg-purple-100 text-purple-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

export function getUrgencyColor(urgency?: UrgencyLevel): string {
  if (!urgency) return 'bg-gray-100 text-gray-800'
  
  const colorMap: Record<UrgencyLevel, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }
  return colorMap[urgency]
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}