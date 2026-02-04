// src/lib/api/cases.ts
import type { Case, CaseFilters, CaseStats } from '@/types/case'
import type { PaginatedResponse } from '@/types/api'
import apiClient from './client'

export const casesApi = {
  async getAll(filters?: CaseFilters): Promise<Case[]> {
    const { data } = await apiClient.get('/api/v1/cases', { params: filters })
    return data
  },

  async getById(id: string): Promise<Case> {
    const { data } = await apiClient.get(`/api/v1/cases/${id}`)
    return data
  },

  async getStats(): Promise<CaseStats> {
    const { data } = await apiClient.get('/api/v1/cases/stats')
    return data
  },

  async getUpcomingHearings(days: number = 7): Promise<Case[]> {
    const { data } = await apiClient.get('/api/v1/cases/upcoming-hearings', {
      params: { days },
    })
    return data
  },

  async search(query: string): Promise<{ cases: Case[] }> {
    const { data } = await apiClient.get('/api/v1/cases/search', {
      params: { q: query },
    })
    return data
  },

  async syncCase(caseData: Partial<Case>): Promise<Case> {
    const { data } = await apiClient.post('/api/v1/sync/cases', caseData)
    return data
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const { data } = await apiClient.patch(`/api/v1/cases/${id}`, updates)
    return data
  },

  async deleteCase(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/cases/${id}`)
  },
}




