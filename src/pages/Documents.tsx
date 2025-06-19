import React, { useState, useEffect } from 'react';
import {
  FiUpload,
  FiDownload,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPlus,
  FiX,
} from 'react-icons/fi';
import {
  documentService,
  DocumentStatusSummary,
} from '@/services/document.service';
import { Document } from '@/types';
import {
  DOCUMENT_TYPES,
  FILE_SIZE_LIMIT,
  ACCEPTED_FILE_TYPES,
} from '@/utils/constants';
import { formatDate, formatFileSize } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface FileUpload {
  file: File;
  type: Document['type'];
  expiryDate?: string;
}

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statusSummary, setStatusSummary] =
    useState<DocumentStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const [docsData, statusData] = await Promise.all([
        documentService.getDocuments(),
        documentService.getDocumentStatus(),
      ]);
      setDocuments(docsData);
      setStatusSummary(statusData);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAdd = () => {
    setFileUploads([
      ...fileUploads,
      { file: null as any, type: '' as Document['type'] },
    ]);
  };

  const handleFileSelect = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > FILE_SIZE_LIMIT) {
      toast.error(
        `File size must be less than ${formatFileSize(FILE_SIZE_LIMIT)}`
      );
      e.target.value = '';
      return;
    }

    const newUploads = [...fileUploads];
    newUploads[index] = { ...newUploads[index], file };
    setFileUploads(newUploads);
  };

  const handleTypeChange = (index: number, type: Document['type']) => {
    const newUploads = [...fileUploads];
    newUploads[index] = { ...newUploads[index], type };
    setFileUploads(newUploads);
  };

  const handleExpiryChange = (index: number, expiryDate: string) => {
    const newUploads = [...fileUploads];
    newUploads[index] = { ...newUploads[index], expiryDate };
    setFileUploads(newUploads);
  };

  const handleRemoveUpload = (index: number) => {
    const newUploads = fileUploads.filter((_, i) => i !== index);
    setFileUploads(newUploads);
  };

  const handleUpload = async () => {
    // Validate all uploads
    const validUploads = fileUploads.filter(
      (upload) => upload.file && upload.type
    );

    if (validUploads.length === 0) {
      toast.error('Please select at least one file with document type');
      return;
    }

    setIsUploading(true);
    const uploadId = Date.now().toString();
    setUploadProgress({ [uploadId]: 0 });

    try {
      // Prepare FormData
      const formData = new FormData();
      const types: string[] = [];

      validUploads.forEach((upload) => {
        formData.append('files', upload.file);
        types.push(upload.type);
        if (upload.expiryDate) {
          formData.append(`expiryDate_${types.length - 1}`, upload.expiryDate);
        }
      });

      // Send types as comma-separated string for backend compatibility
      formData.append('types', types.join(','));

      const response = await documentService.uploadMultipleDocuments(
        formData,
        (progress) => {
          setUploadProgress({ [uploadId]: progress });
        }
      );

      toast.success(response.message || 'Documents uploaded successfully');
      fetchDocuments();
      setFileUploads([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentService.downloadDocument(doc.id);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className='h-5 w-5 text-green-600' />;
      case 'rejected':
        return <FiXCircle className='h-5 w-5 text-red-600' />;
      default:
        return <FiClock className='h-5 w-5 text-yellow-600' />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}
      >
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Documents</h1>
        <p className='text-gray-600 mt-1'>
          Upload and manage your application documents
        </p>
      </div>

      {/* Status Summary */}
      {statusSummary && (
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='card text-center'>
            <p className='text-3xl font-bold text-gray-900'>
              {statusSummary.total}
            </p>
            <p className='text-sm text-gray-600'>Total</p>
          </div>
          <div className='card text-center'>
            <p className='text-3xl font-bold text-yellow-600'>
              {statusSummary.pending}
            </p>
            <p className='text-sm text-gray-600'>Pending</p>
          </div>
          <div className='card text-center'>
            <p className='text-3xl font-bold text-green-600'>
              {statusSummary.approved}
            </p>
            <p className='text-sm text-gray-600'>Approved</p>
          </div>
          <div className='card text-center'>
            <p className='text-3xl font-bold text-red-600'>
              {statusSummary.rejected}
            </p>
            <p className='text-sm text-gray-600'>Rejected</p>
          </div>
          <div className='card text-center'>
            <p className='text-3xl font-bold text-orange-600'>
              {statusSummary.expired}
            </p>
            <p className='text-sm text-gray-600'>Expired</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className='card'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Upload Documents
          </h2>
          <button
            onClick={handleFileAdd}
            className='btn btn-outline btn-sm flex items-center gap-2'
          >
            <FiPlus className='h-4 w-4' />
            Add File
          </button>
        </div>

        <div className='space-y-4'>
          {fileUploads.length === 0 ? (
            <div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
              <p className='text-gray-500 mb-2'>No files selected</p>
              <button
                onClick={handleFileAdd}
                className='btn btn-secondary btn-sm'
              >
                Add First File
              </button>
            </div>
          ) : (
            <>
              {fileUploads.map((upload, index) => (
                <div key={index} className='border rounded-lg p-4 bg-gray-50'>
                  <div className='flex justify-between items-start mb-3'>
                    <h4 className='font-medium text-gray-900'>
                      File {index + 1}
                    </h4>
                    <button
                      onClick={() => handleRemoveUpload(index)}
                      className='text-gray-400 hover:text-red-600'
                    >
                      <FiX className='h-4 w-4' />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    <div>
                      <label className='label text-sm'>Document Type *</label>
                      <select
                        value={upload.type}
                        onChange={(e) =>
                          handleTypeChange(
                            index,
                            e.target.value as Document['type']
                          )
                        }
                        className='input input-sm'
                      >
                        <option value=''>Select type</option>
                        {Object.entries(DOCUMENT_TYPES).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className='label text-sm'>Select File *</label>
                      <input
                        type='file'
                        accept={ACCEPTED_FILE_TYPES.all}
                        onChange={(e) => handleFileSelect(index, e)}
                        className='input input-sm'
                      />
                    </div>

                    <div>
                      <label className='label text-sm'>Expiry Date</label>
                      <input
                        type='date'
                        value={upload.expiryDate || ''}
                        onChange={(e) =>
                          handleExpiryChange(index, e.target.value)
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className='input input-sm'
                      />
                    </div>
                  </div>

                  {upload.file && (
                    <div className='mt-2 text-sm text-gray-600'>
                      <span className='font-medium'>{upload.file.name}</span> •{' '}
                      {formatFileSize(upload.file.size)}
                    </div>
                  )}
                </div>
              ))}

              {Object.keys(uploadProgress).length > 0 && (
                <div className='space-y-2'>
                  {Object.entries(uploadProgress).map(([id, progress]) => (
                    <div key={id}>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-primary-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setFileUploads([])}
                  className='btn btn-outline'
                  disabled={isUploading}
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || fileUploads.length === 0}
                  className='btn btn-primary flex items-center gap-2'
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size='sm' />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload className='h-4 w-4' />
                      Upload {fileUploads.length} Document
                      {fileUploads.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className='card'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Your Documents
        </h2>
        {documents.length > 0 ? (
          <div className='space-y-3'>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
              >
                <div className='flex items-center space-x-4'>
                  {getStatusIcon(doc.status)}
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {DOCUMENT_TYPES[doc.type]}
                    </h3>
                    {/* <div className='flex items-center gap-4 text-sm text-gray-600 mt-1'>
                      <span>{doc.fileName}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                      {doc.expiryDate && (
                        <span>Expires {formatDate(doc.expiryDate)}</span>
                      )}
                    </div> */}
                    {doc.notes && (
                      <p className='text-sm text-gray-500 mt-1'>{doc.notes}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {getStatusBadge(doc.status)}
                  <div className='flex items-center gap-1 ml-4'>
                    <button
                      onClick={() => handleDownload(doc)}
                      className='p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded'
                      title='Download'
                    >
                      <FiDownload className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() =>
                        window.open(`/documents/${doc.id}`, '_blank')
                      }
                      className='p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded'
                      title='View'
                    >
                      <FiEye className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className='p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded'
                      title='Delete'
                    >
                      <FiTrash2 className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-center text-gray-500 py-8'>
            No documents uploaded yet
          </p>
        )}
      </div>
    </div>
  );
};
