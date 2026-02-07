import { CaseHistory } from "./history"
import { AIAnalysis } from "./analysis"
import { Case } from '@prisma/client';
export type { CaseStatus } from '@prisma/client';
// export type CaseStatus = 
//   | 'filed' 
//   | 'registered' 
//   | 'pending' 
//   | 'disposed' 
//   | 'transferred'

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

export interface CaseBundle {
  caseId: string;
  documents: CaseDocument[];
}

export interface CaseDocument {
  id: string;
  type: 'PETITION' | 'AFFIDAVIT' | 'ANNEXURE' | 'COUNTER' | 'REJOINDER' | 'INTERIM_ORDER' | 'DAILY_ORDER' | 'OTHER';
  name: string;
  uploadDate: string;
  fileUrl: string;
  size: number;
}

export const CASE_TYPE_LABELS: Record<Case['case_type'], string> = {
  WP_CR: 'Writ Petition (Criminal)',
  WP_CIVIL: 'Writ Petition (Civil)',
  CRL_A: 'Criminal Appeal',
  CRL_RP: 'Criminal Revision Petition',
  CIVIL_APPEAL: 'Civil Appeal',
  OTHER: 'Other'
}
// Add to existing case.ts

export interface CasePrepAnalysis {
  case_id: string
  risk_assessment?: {
    overall_score: number // 0-100
    strengths: string[]
    weaknesses: string[]
    fatal_flaws: string[]
    last_analyzed: string
  }
  urgent_relief?: {
    feasibility_score: number
    recommended_prayers: string[]
    requirements: string[]
    last_analyzed: string
  }
  precedents?: {
    count: number
    last_updated: string
  }
  constitutional_rights?: {
    identified_articles: string[]
    last_analyzed: string
  }
  status: 'not_started' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface CasePrepFilters extends CaseFilters {
  has_analysis?: boolean
  prep_status?: CasePrepAnalysis['status']
}
export type CaseWithDetails = Case & {
  documents: any[];
};
