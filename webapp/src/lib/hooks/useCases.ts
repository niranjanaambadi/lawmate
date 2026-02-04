
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { casesApi } from '@/lib/api/cases'
import type { Case, CaseFilters } from '@/types/case'
import { toast } from 'sonner'
export function useCases(filters?: CaseFilters) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: async () => {
      const response = await casesApi.getAll(filters)
      const total = response.length
      const per_page = filters?.per_page || 20
      
      return {
        items: response,
        total: total,
        page: filters?.page || 1,
        per_page: per_page,
        total_pages: Math.ceil(total / per_page), // Add this line
      }
    },
    staleTime: 1000 * 60,
  })
}
// export function useCases(filters?: CaseFilters) {
//   return useQuery({
//     queryKey: ['cases', filters],
//     queryFn: async () => {
//       const response = await casesApi.getAll(filters)
      
//       // Transform backend response to match expected format
//       return {
//         items: response, // Backend returns array directly
//         total: response.length, // TODO: Backend should return total count
//         page: filters?.page || 1,
//         per_page: filters?.per_page || 20,
//       }
//     },
//     staleTime: 1000 * 60, // 1 minute
//   })
// }

export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => casesApi.getById(id),
    enabled: !!id,
  })
}

export function useCaseStats() {
  return useQuery({
    queryKey: ['case-stats'],
    queryFn: () => casesApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useUpcomingHearings(days: number = 7) {
  return useQuery({
    queryKey: ['upcoming-hearings', days],
    queryFn: () => casesApi.getUpcomingHearings(days),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useUpdateCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Case> }) =>
      casesApi.updateCase(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['case', data.id] })
      toast.success('Case updated successfully')
    },
    onError: () => {
      toast.error('Failed to update case')
    },
  })
}

export function useDeleteCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => casesApi.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Case deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete case')
    },
  })
}
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { casesApi } from '@/lib/api/cases'
// import type { Case, CaseFilters } from '@/types/case'
// import { toast } from 'sonner'

// export function useCases(filters?: CaseFilters) {
//   return useQuery({
//     queryKey: ['cases', filters],
//     queryFn: () => casesApi.getAll(filters),
//     staleTime: 1000 * 60, // 1 minute
//   })
// }

// export function useCase(id: string) {
//   return useQuery({
//     queryKey: ['case', id],
//     queryFn: () => casesApi.getById(id),
//     enabled: !!id,
//   })
// }

// export function useCaseStats() {
//   return useQuery({
//     queryKey: ['case-stats'],
//     queryFn: () => casesApi.getStats(),
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   })
// }

// export function useUpcomingHearings(days: number = 7) {
//   return useQuery({
//     queryKey: ['upcoming-hearings', days],
//     queryFn: () => casesApi.getUpcomingHearings(days),
//     staleTime: 1000 * 60, // 1 minute
//   })
// }

// export function useUpdateCase() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: ({ id, updates }: { id: string; updates: Partial<Case> }) =>
//       casesApi.updateCase(id, updates),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ['cases'] })
//       queryClient.invalidateQueries({ queryKey: ['case', data.id] })
//       toast.success('Case updated successfully')
//     },
//     onError: () => {
//       toast.error('Failed to update case')
//     },
//   })
// }

// export function useDeleteCase() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (id: string) => casesApi.deleteCase(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['cases'] })
//       toast.success('Case deleted successfully')
//     },
//     onError: () => {
//       toast.error('Failed to delete case')
//     },
//   })
// }