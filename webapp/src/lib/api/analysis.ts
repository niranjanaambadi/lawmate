import type { AIAnalysis, ChatRequest, ChatResponse } from '@/types/analysis'
import apiClient from './client'

export const analysisApi = {
  async getAnalysis(caseId: string): Promise<AIAnalysis> {
    const { data } = await apiClient.get(`/api/v1/analysis/${caseId}`)
    return data
  },

  async triggerAnalysis(caseId: string): Promise<{ job_id: string }> {
    const { data } = await apiClient.post(`/api/v1/analysis/${caseId}/trigger`)
    return data
  },

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { data } = await apiClient.post('/api/v1/ai/chat', request)
    return data
  },

  async getDeadlines(daysAhead: number = 30): Promise<AIAnalysis[]> {
    const { data } = await apiClient.get('/api/v1/analysis/deadlines', {
      params: { days: daysAhead },
    })
    return data
  },
}