import { CaseHistory } from "./history"
import { AIAnalysis } from "./analysis"

export type CaseStatus = 
  | 'filed' 
  | 'registered' 
  | 'pending' 
  | 'disposed' 
  | 'transferred'

export type CasePartyRole = 'petitioner' | 'respondent' | 'appellant' | 'defendant'

export interface Case {
  id: string
  advocate_id: string
  case_number?: string
  efiling_number: string
  case_type: string
  case_year: number
  party_role: CasePartyRole
  petitioner_name: string
  respondent_name: string
  efiling_date: string
  efiling_details?: string
  bench_type?: string
  judge_name?: string
  court_number?: string
  status: CaseStatus
  next_hearing_date?: string
  khc_source_url?: string
  last_synced_at?: string
  sync_status: string
  is_visible: boolean
  transferred_reason?: string
  transferred_at?: string
  created_at: string
  updated_at: string
  
  // Relations (populated in some endpoints)
  documents?: Document[]
  history?: CaseHistory[]
  ai_analysis?: AIAnalysis
}

export interface CaseFilters {
  status?: CaseStatus | 'all'
  case_type?: string
  case_year?: number
  search?: string
  sort?: 'case_number' | 'next_hearing_date' | 'efiling_date' | 'updated_at'
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface CaseStats {
  total_cases: number
  pending_cases: number
  disposed_cases: number
  upcoming_hearings: number
  total_documents: number
  cases_by_status: Record<CaseStatus, number>
  cases_by_type: Record<string, number>
  monthly_trend: Array<{
    month: string
    count: number
  }>
}