export type SubscriptionPlan = 'free' | 'professional' | 'enterprise'

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'none'

export type BillingCycle = 'monthly' | 'annually'

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  billing_cycle: BillingCycle
  amount: number
  currency: string
  start_date: string
  end_date: string
  trial_end_date?: string
  auto_renew: boolean
  payment_method?: PaymentMethod
  created_at: string
  updated_at: string
}

export interface PlanFeatures {
  max_cases: number | 'unlimited'
  max_documents: number | 'unlimited'
  ai_analyses_per_month: number | 'unlimited'
  storage_gb: number | 'unlimited'
  priority_support: boolean
  api_access: boolean
  custom_branding: boolean
  multi_user: boolean
  advanced_reports: boolean
}

export interface PlanDetails {
  id: SubscriptionPlan
  name: string
  description: string
  price_monthly: number
  price_annually: number
  features: PlanFeatures
  popular?: boolean
}

export interface Invoice {
  id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  invoice_date: string
  due_date: string
  paid_date?: string
  payment_method?: PaymentMethod
  invoice_url?: string
}

export interface UsageStats {
  cases_count: number
  documents_count: number
  storage_used_gb: number
  ai_analyses_used: number
  period_start: string
  period_end: string
}