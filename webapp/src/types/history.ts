export type CaseEventType = 
  | 'hearing' 
  | 'order' 
  | 'judgment' 
  | 'filing' 
  | 'notice'

export interface CaseHistory {
  id: string
  case_id: string
  event_type: CaseEventType
  event_date: string
  business_recorded: string
  judge_name?: string
  bench_type?: string
  court_number?: string
  next_hearing_date?: string
  order_document_id?: string
  created_at: string
}