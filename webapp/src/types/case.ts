// src/types/case.ts
import { CaseHistory } from "./history"
import { AIAnalysis } from "./analysis"
import { 
  Case as PrismaCase, 
  CaseStatus,
  CasePartyRole as PrismaCasePartyRole, 
  CasePartyRole
} from '@prisma/client';

// Re-export Prisma enums
export type { CaseStatus, CasePartyRole };

// Extend Prisma's Case type with relations and additional fields
export interface Case extends PrismaCase {
  // Relations (populated in some endpoints)
  documents?: any[]; // Use Document type if you have it
  history?: CaseHistory[];
  aiAnalysis?: AIAnalysis | null;
  _count?: {
    documents: number;
    history: number;
  };
}

export interface CaseFilters {
  status?: CaseStatus | 'all'
  case_type?: string
  case_year?: number
  search?: string
  sort?: 'caseNumber' | 'nextHearingDate' | 'efilingDate' | 'updatedAt'
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

export const CASE_TYPE_LABELS: Record<string, string> = {
  WP_CR: 'Writ Petition (Criminal)',
  WP_CIVIL: 'Writ Petition (Civil)',
  CRL_A: 'Criminal Appeal',
  CRL_RP: 'Criminal Revision Petition',
  CIVIL_APPEAL: 'Civil Appeal',
  OTHER: 'Other'
}

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
