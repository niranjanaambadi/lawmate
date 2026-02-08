// src/types/document.ts
import { 
  Document as PrismaDocument, 
  DocumentCategory, 
  UploadStatus, 
  OcrStatus 
} from '@prisma/client';

export type { DocumentCategory, UploadStatus, OcrStatus };

// Extend Prisma's Document type
export interface Document extends PrismaDocument {
  // These fields are already in Prisma, so no need to redeclare:
  // - extractedText (optional string)
  // - classificationConfidence (optional number)
  // - aiMetadata (optional Json)
  
  // Computed fields (not in database)
  presignedUrl?: string; // Changed to camelCase
}

export interface DocumentUploadRequest {
  caseId: string;
  category: DocumentCategory;
  title: string;
  file: File;
}

export interface DocumentUploadResponse {
  document: Document;
  message?: string;
}

export interface DocumentFilters {
  caseId?: string;
  category?: DocumentCategory;
  uploadStatus?: UploadStatus;
  ocrStatus?: OcrStatus;
  search?: string;
  isLocked?: boolean;
}

export interface DocumentWithUrl extends Document {
  presignedUrl: string; // Guaranteed to have URL
}

// Helper type for document lists with case info
export interface DocumentWithCase extends Document {
  case?: {
    id: string;
    caseNumber: string | null;
    efilingNumber: string;
    caseType: string;
  };
}

// Type for document classification result
export interface DocumentClassification {
  documentId: string;
  type: string;
  confidence: number;
  metadata: {
    date?: string;
    parties?: string[];
    keyPoints?: string[];
    documentNumber?: string;
  };
}