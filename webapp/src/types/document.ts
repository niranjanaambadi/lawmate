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
  id: string
  case_id: string
  khc_document_id: string
  category: DocumentCategory
  title: string
  description?: string
  s3_key: string
  s3_bucket: string
  s3_version_id?: string
  file_size: number
  content_type: string
  checksum_md5?: string
  upload_status: UploadStatus
  uploaded_at?: string
  upload_error?: string
  source_url?: string
  is_ocr_required: boolean
  ocr_status: OCRStatus
  ocr_job_id?: string
  is_locked: boolean
  lock_reason?: string
  locked_at?: string
  created_at: string
  updated_at: string
  
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
