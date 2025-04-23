import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { FileText, Upload, FolderPlus, Search, Filter, Grid, List, Tag, Lock, Download, Share2, Trash2, History, UserCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useDropzone } from 'react-dropzone';
import Editor from '../../components/documents/Editor';
import VersionHistory from '../../components/documents/VersionHistory';
import ApprovalFlow from '../../components/documents/ApprovalFlow';
import { Document } from '../../types';
import { documentService } from '../../services/documents';

const DocumentsPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showApprovalFlow, setShowApprovalFlow] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  
  // Mock documents data
  const documents: Document[] = [
    {
      id: '1',
      title: 'Project Proposal 2025',
      description: 'Q1 project proposal and budget estimation',
      fileUrl: '#',
      createdAt: '2025-04-22T10:30:00Z',
      updatedAt: '2025-04-22T10:30:00Z',
      tags: ['proposal', 'budget'],
      size: 2500000,
      type: 'application/pdf',
      version: 1,
      versions: [
        {
          id: '1',
          documentId: '1',
          version: 1,
          fileUrl: '#',
          createdBy: {
            id: '1',
            name: 'John Doe',
            avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          createdAt: '2025-04-22T10:30:00Z',
          changes: 'Initial version'
        }
      ],
      permissions: [],
      classification: 'confidential',
      encryptionStatus: 'encrypted',
      accessLog: []
    }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file upload
    console.log('Accepted files:', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentChange = async (content: string) => {
    setDocumentContent(content);
    if (selectedDoc) {
      try {
        await documentService.updateDocument(selectedDoc, { content });
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Documents</h1>
          <p className="mt-1 text-gray-600">Manage and organize your documents securely</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            <FolderPlus size={16} className="mr-2" />
            New Folder
          </Button>
          <Button>
            <Upload size={16} className="mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          `}
        >
          <input {...getInputProps()} />
          <FileText size={32} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX, TXT, MD
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={view === 'grid' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('grid')}
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setView('list')}
                  >
                    <List size={16} />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>

            <div className="p-4">
              {view === 'grid' ? (
                <div className="grid grid-cols-1 gap-4">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        selectedDoc === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedDoc(doc.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText size={20} className="text-blue-600" />
                          <h3 className="ml-2 text-sm font-medium text-gray-900">{doc.title}</h3>
                        </div>
                        <Lock size={16} className="text-gray-400" />
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {doc.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {doc.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedDoc === doc.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedDoc(doc.id)}
                    >
                      <FileText size={20} className="text-blue-600 mr-3" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {formatFileSize(doc.size)} • {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Share2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Document Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Document Editor</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Edit and collaborate on documents
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersionHistory(true)}
                  >
                    <History size={16} className="mr-2" />
                    History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApprovalFlow(true)}
                  >
                    <UserCheck size={16} className="mr-2" />
                    Approvals
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {selectedDoc ? (
                <div className="space-y-6">
                  <Editor
                    content={documentContent}
                    onChange={handleDocumentChange}
                  />
                  
                  {showVersionHistory && (
                    <VersionHistory
                      versions={documents.find(d => d.id === selectedDoc)?.versions || []}
                      currentVersion="1"
                      onViewVersion={() => {}}
                      onCompareVersions={() => {}}
                    />
                  )}
                  
                  {showApprovalFlow && (
                    <ApprovalFlow
                      approvers={[
                        {
                          id: '1',
                          name: 'John Doe',
                          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
                          status: 'pending'
                        }
                      ]}
                      currentUserId="1"
                      onApprove={() => {}}
                      onReject={() => {}}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No document selected</h3>
                  <p className="mt-1 text-gray-500">
                    Select a document from the list to start editing
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;