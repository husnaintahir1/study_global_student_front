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
  FiFileText,
  FiFolder,
  FiAlertTriangle,
  FiInfo,
  FiFilter,
  FiSearch
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

export const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [statusSummary, setStatusSummary] = useState<DocumentStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, statusFilter]);

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

  const filterDocuments = () => {
    let filtered = documents;
    
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        DOCUMENT_TYPES[doc.type]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }
    
    setFilteredDocuments(filtered);
  };

  const handleFileAdd = () => {
    setFileUploads([
      ...fileUploads,
      { file: null as any, type: '' as Document['type'] },
    ]);
  };

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > FILE_SIZE_LIMIT) {
      toast.error(`File size must be less than ${formatFileSize(FILE_SIZE_LIMIT)}`);
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
    const validUploads = fileUploads.filter(upload => upload.file && upload.type);

    if (validUploads.length === 0) {
      toast.error('Please select at least one file with document type');
      return;
    }

    setIsUploading(true);
    const uploadId = Date.now().toString();
    setUploadProgress({ [uploadId]: 0 });

    try {
      const formData = new FormData();
      const types: string[] = [];

      validUploads.forEach((upload) => {
        formData.append('files', upload.file);
        types.push(upload.type);
        if (upload.expiryDate) {
          formData.append(`expiryDate_${types.length - 1}`, upload.expiryDate);
        }
      });

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
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <FiXCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FiClock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/60`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Document Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload, manage, and track your application documents securely
          </p>
        </div>

        {/* Status Summary */}
        {statusSummary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={FiFileText}
              label="Total Documents"
              value={statusSummary.total}
              color="text-gray-700"
              bgColor="bg-white"
            />
            <StatCard
              icon={FiClock}
              label="Pending Review"
              value={statusSummary.pending}
              color="text-yellow-600"
              bgColor="bg-gradient-to-br from-yellow-50 to-orange-50"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Approved"
              value={statusSummary.approved}
              color="text-green-600"
              bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
            />
            <StatCard
              icon={FiXCircle}
              label="Rejected"
              value={statusSummary.rejected}
              color="text-red-600"
              bgColor="bg-gradient-to-br from-red-50 to-pink-50"
            />
            <StatCard
              icon={FiAlertTriangle}
              label="Expired"
              value={statusSummary.expired}
              color="text-orange-600"
              bgColor="bg-gradient-to-br from-orange-50 to-yellow-50"
            />
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload New Documents</h2>
                <p className="text-gray-600">Add multiple documents at once with automatic processing</p>
              </div>
              <button
                onClick={handleFileAdd}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FiPlus className="h-5 w-5" />
                Add Document
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FiInfo className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Document Requirements</h4>
                  <p className="text-sm text-blue-800">
                    Upload clear, high-quality scans. Accepted formats: PDF, JPG, PNG. 
                    Maximum file size: {formatFileSize(FILE_SIZE_LIMIT)}. 
                    Some documents may require MOFA attestation.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {fileUploads.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                  <FiFolder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 mb-4">No documents selected for upload</p>
                  <button
                    onClick={handleFileAdd}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Select Your First Document
                  </button>
                </div>
              ) : (
                <>
                  {fileUploads.map((upload, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FiFileText className="h-5 w-5 text-blue-600" />
                          Document {index + 1}
                        </h4>
                        <button
                          onClick={() => handleRemoveUpload(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={upload.type}
                            onChange={(e) => handleTypeChange(index, e.target.value as Document['type'])}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                          >
                            <option value="">Select document type</option>
                            {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select File <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept={ACCEPTED_FILE_TYPES.all}
                            onChange={(e) => handleFileSelect(index, e)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={upload.expiryDate || ''}
                            onChange={(e) => handleExpiryChange(index, e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                          />
                        </div>
                      </div>

                      {upload.file && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FiFileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">{upload.file.name}</p>
                              <p className="text-sm text-blue-700">{formatFileSize(upload.file.size)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-blue-900">Uploading documents...</span>
                            <span className="text-blue-700">{progress}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setFileUploads([])}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      disabled={isUploading}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading || fileUploads.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isUploading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="h-5 w-5" />
                          Upload {fileUploads.length} Document{fileUploads.length > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-200/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Documents</h2>
                <p className="text-gray-600">Manage and track all your uploaded documents</p>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredDocuments.length > 0 ? (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        {getStatusIcon(doc.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {DOCUMENT_TYPES[doc.type]}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {doc.fileName && <span>{doc.fileName}</span>}
                          {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                          <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                          {doc.expiryDate && (
                            <span className="text-orange-600 font-medium">
                              Expires {formatDate(doc.expiryDate)}
                            </span>
                          )}
                        </div>
                        {doc.notes && (
                          <p className="text-sm text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                            {doc.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc.status)}
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Download"
                        >
                          <FiDownload className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                          className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                          title="View"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiFileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500 mb-2">
                  {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
                </p>
                <p className="text-gray-400">
                  {documents.length === 0 ? 'Upload your first document to get started' : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};