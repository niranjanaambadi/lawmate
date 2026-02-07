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
// src/lib/api/documents.ts
export async function classifyDocument(caseId: string, documentId: string) {
  const response = await fetch(`/api/cases/${caseId}/documents/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to classify document');
  }
  
  return response.json();
}

export async function classifyAllDocuments(caseId: string) {
  const response = await fetch(`/api/cases/${caseId}/documents/classify`);
  
  if (!response.ok) {
    throw new Error('Failed to classify documents');
  }
  
  return response.json();
}

export async function uploadDocument(
  caseId: string, 
  file: File, 
  metadata: { category: string; title: string }
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', metadata.category);
  formData.append('title', metadata.title);

  const response = await fetch(`/api/cases/${caseId}/documents/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return response.json();
}