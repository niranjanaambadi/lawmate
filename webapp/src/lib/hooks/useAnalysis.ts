import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisApi } from '@/lib/api/analysis'
import type { ChatRequest } from '@/types/analysis'
import { toast } from 'sonner'

export function useAnalysis(caseId: string) {
  return useQuery({
    queryKey: ['analysis', caseId],
    queryFn: () => analysisApi.getAnalysis(caseId),
    enabled: !!caseId,
    retry: 1,
  })
}

export function useTriggerAnalysis() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (caseId: string) => analysisApi.triggerAnalysis(caseId),
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({ queryKey: ['analysis', caseId] })
      toast.success('Analysis started. This may take a few minutes.')
    },
    onError: (error: Error) => {
      toast.error(`Failed to trigger analysis: ${error.message}`)
    },
  })
}

export function useAIChat() {
  return useMutation({
    mutationFn: (request: ChatRequest) => analysisApi.chat(request),
    onError: (error: Error) => {
      toast.error(`Chat failed: ${error.message}`)
    },
  })
}

export function useDeadlines(daysAhead: number = 30) {
  return useQuery({
    queryKey: ['deadlines', daysAhead],
    queryFn: () => analysisApi.getDeadlines(daysAhead),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}