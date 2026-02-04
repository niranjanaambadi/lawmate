import type { Document, DocumentUploadRequest, DocumentUploadResponse } from '@/types/document'
import apiClient from './client'

export const documentsApi = {
  async getByCaseId(caseId: string): Promise<Document[]> {
    const { data } = await apiClient.get(`/api/v1/documents`, {
      params: { case_id: caseId },
    })
    return data
  },

  async getById(id: string): Promise<Document> {
    const { data } = await apiClient.get(`/api/v1/documents/${id}`)
    return data
  },

  async getPresignedUrl(s3Key: string): Promise<string> {
    const { data } = await apiClient.post('/api/v1/documents/presigned-url', {
      s3_key: s3Key,
      operation: 'get',
    })
    return data.url
  },

  async initiateUpload(
    request: Omit<DocumentUploadRequest, 'file'>
  ): Promise<DocumentUploadResponse> {
    const { data } = await apiClient.post('/api/v1/upload/initiate', request)
    return data
  },

  async uploadToS3(url: string, file: File): Promise<void> {
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
  },

  async confirmUpload(documentId: string): Promise<Document> {
    const { data } = await apiClient.post(`/api/v1/documents/${documentId}/confirm`)
    return data
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/documents/${id}`)
  },
}