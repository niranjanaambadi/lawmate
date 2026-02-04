import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/lib/api/documents'
import type { DocumentUploadRequest } from '@/types/document'
import { toast } from 'sonner'
import { validatePDF } from '@/lib/utils/file'

export function useDocuments(caseId: string) {
  return useQuery({
    queryKey: ['documents', caseId],
    queryFn: () => documentsApi.getByCaseId(caseId),
    enabled: !!caseId, // Important: only fetch if caseId exists
    retry: 1, // Don't retry too many times
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  })
}

export function useDocumentUrl(s3Key?: string) {
  return useQuery({
    queryKey: ['document-url', s3Key],
    queryFn: () => documentsApi.getPresignedUrl(s3Key!),
    enabled: !!s3Key,
    staleTime: 1000 * 60 * 50, // 50 minutes (URLs valid for 1 hour)
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: DocumentUploadRequest) => {
      // Validate file
      const validation = validatePDF(request.file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Step 1: Initiate upload
      const uploadResponse = await documentsApi.initiateUpload({
        case_id: request.case_id,
        category: request.category,
        title: request.title,
      })

      // Step 2: Upload to S3
      await documentsApi.uploadToS3(uploadResponse.upload_url, request.file)

      // Step 3: Confirm upload
      return await documentsApi.confirmUpload(uploadResponse.document_id)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.case_id] })
      toast.success('Document uploaded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document')
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete document')
    },
  })
}