import { Document as PrismaDocument } from '@prisma/client';

  // Prisma already has all fields in camelCase
  // Just add any additional relations if needed


export type { DocumentCategory, UploadStatus, OcrStatus } from '@prisma/client';
// export type DocumentCategory = 
//   | 'case_file' 
//   | 'annexure' 
//   | 'judgment' 
//   | 'order' 
//   | 'misc'

// export type UploadStatus = 
//   | 'pending' 
//   | 'uploading' 
//   | 'completed' 
//   | 'failed'

// export type OCRStatus = 
//   | 'not_required' 
//   | 'pending' 
//   | 'processing' 
//   | 'completed' 
//   | 'failed'

export interface Document extends PrismaDocument { 
  extractedText :    string
  classificationConfidence: Float
  aiMetadata :       Json
  // Computed fields
  presigned_url?: string
}

export interface DocumentUploadRequest {
  case_id: string
  category: DocumentCategory
  title: string
  file: File
}

export interface DocumentUploadResponse {
  document_id: string
  upload_url: string
  fields: Record<string, string>
}
