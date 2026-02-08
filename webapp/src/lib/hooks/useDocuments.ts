// src/lib/hooks/useDocuments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DocumentUploadRequest, DocumentUploadResponse } from '@/types/document'

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DocumentUploadRequest) => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('category', data.category)
      formData.append('title', data.title)

      const response = await fetch(`/api/cases/${data.caseId}/documents/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      return response.json() as Promise<DocumentUploadResponse>
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch documents for this case
      queryClient.invalidateQueries({ 
        queryKey: ['documents', variables.caseId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['case', variables.caseId] 
      })
    },
  })
}

export function useDocuments(caseId: string) {
  return useQuery({
    queryKey: ['documents', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/documents`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      return response.json()
    },
    enabled: !!caseId,
  })
}

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }
      return response.json()
    },
    enabled: !!documentId,
  })
}

export function useDocumentUrl(s3Key: string | undefined) {
  return useQuery({
    queryKey: ['document-url', s3Key],
    queryFn: async () => {
      if (!s3Key) return null
      
      const response = await fetch(`/api/documents/url?key=${encodeURIComponent(s3Key)}`)
      if (!response.ok) {
        throw new Error('Failed to get document URL')
      }
      const data = await response.json()
      return data.url
    },
    enabled: !!s3Key,
    staleTime: 5 * 60 * 1000, // 5 minutes (presigned URLs expire)
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ documentId, caseId }: { documentId: string; caseId: string }) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['documents', variables.caseId] 
      })
    },
  })
}