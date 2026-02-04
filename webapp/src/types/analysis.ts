export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

export type AIAnalysisStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed'

export interface DeadlineReminder {
  task: string
  due_date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  description?: string
}

export interface PrecedentCase {
  name: string
  citation: string
  relevance: string
  summary?: string
}

export interface AnalysisContent {
  case_type_classification: string
  key_legal_issues: string[]
  relevant_statutes: string[]
  precedent_cases: PrecedentCase[]
  action_items: string[]
  urgency_level: UrgencyLevel
  deadline_reminders: DeadlineReminder[]
  case_summary: string
  strengths?: string[]
  weaknesses?: string[]
  recommendations?: string[]
}

export interface AIAnalysis {
  id: string
  case_id: string
  advocate_id: string
  status: AIAnalysisStatus
  model_version: string
  analysis: AnalysisContent
  urgency_level?: UrgencyLevel
  case_summary?: string
  processed_at?: string
  processing_time_seconds?: number
  token_count?: number
  error_message?: string
  retry_count: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  document_id: string
  message: string
  conversation_history?: ChatMessage[]
}

export interface ChatResponse {
  response: string
  token_count?: number
}