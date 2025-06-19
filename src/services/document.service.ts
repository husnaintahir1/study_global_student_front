import { api } from './api';
import { Document } from '@/types';

export interface DocumentUploadResponse {
  document: Document;
  message: string;
}

export interface DocumentStatusSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}

class DocumentService {
  async getDocuments(): Promise<Document[]> {
    return api.get<Document[]>('/student/documents/status');
  }

  async getDocumentById(id: string): Promise<Document> {
    return api.get<Document>(`/student/documents/${id}`);
  }

  async uploadDocument(
    file: File,
    type: Document['type'],
    expiryDate?: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('types', type);
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    return api.upload<DocumentUploadResponse>(
      '/student/reviews/documents',
      formData,
      onProgress
    );
  }

  async uploadMultipleDocuments(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<{ message: string; documents: Document[] }> {
    return api.upload<{ message: string; documents: Document[] }>(
      '/student/reviews/documents',
      formData,
      onProgress
    );
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return api.delete(`/student/documents/${id}`);
  }

  async getDocumentStatus(): Promise<DocumentStatusSummary> {
    return api.get<DocumentStatusSummary>('/student/documents/status');
  }

  async downloadDocument(id: string): Promise<void> {
    const response = await api.get<Blob>(`/student/documents/${id}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async submitDocumentsForReview(
    documentIds: string[]
  ): Promise<{ message: string }> {
    return api.post('/student/reviews/documents', { documentIds });
  }

  async getDocumentRequirements(): Promise<
    Array<{
      type: Document['type'];
      required: boolean;
      description: string;
      uploaded: boolean;
    }>
  > {
    return api.get('/student/documents/requirements');
  }
}

export const documentService = new DocumentService();
