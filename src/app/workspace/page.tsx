'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { 
  Upload, 
  FileArchive, 
  CheckCircle, 
  AlertTriangle,
  X,
  CloudUpload,
  RefreshCw,
  File,
  Globe,
  Package,
  Trash2
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: 'uploading' | 'completed' | 'failed';
  progress?: number;
  url?: string;
  buildId?: string;
}

interface StorageObject {
  key: string;
  relativePath: string;
  size: number;
  sizeFormatted: string;
  lastModified: string;
  storageClass: string;
  etag: string;
  contentType: string;
  url: string;
}

interface StorageListResponse {
  success: boolean;
  data: {
    objects: StorageObject[];
    grouped: {
      builds: StorageObject[];
      deployments: StorageObject[];
      assets: StorageObject[];
      other: StorageObject[];
    };
    stats: {
      totalFiles: number;
      totalSize: number;
      totalSizeFormatted: string;
      builds: number;
      deployments: number;
      assets: number;
      other: number;
    };
  };
  meta: {
    tenantId: string;
    tenantName: string;
    prefix: string;
    maxKeys: number;
    hasMore: boolean;
    nextStartAfter: string | null;
    awsConfigured: boolean;
  };
}

export default function WorkspacePage() {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Storage list states
  const [storageData, setStorageData] = useState<StorageListResponse['data'] | null>(null);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [storageError, setStorageError] = useState<string>('');
  const [currentStartAfter, setCurrentStartAfter] = useState<string | null>(null);
  
  // Deletion states
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [fileToDelete, setFileToDelete] = useState<StorageObject | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch uploaded files from storage API
  const fetchUploadedFiles = async (startAfter?: string, reset: boolean = true) => {
    setIsLoadingStorage(true);
    setStorageError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        prefix: 'builds/',
        maxKeys: '50',
      });

      if (startAfter) {
        queryParams.append('startAfter', startAfter);
      }

      const response = await fetch(`http://localhost:8000/api/storage/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false, 
          error: 'Unknown error', 
          message: 'Failed to fetch files' 
        }));
        
        let errorMessage = errorData.message || 'Failed to fetch files';
        
        switch (response.status) {
          case 401:
            errorMessage = errorData.message || 'Invalid or missing authentication token. Please log in again.';
            break;
          case 403:
            errorMessage = errorData.message || 'Access denied. Insufficient permissions.';
            break;
          case 404:
            errorMessage = errorData.message || 'User is not a member of any active tenant. Please contact support.';
            break;
          case 500:
            // Check if it's AWS configuration error
            if (errorData.error === 'AWS configuration error') {
              errorMessage = errorData.message || 'S3 service not properly configured. Please contact support.';
            } else {
              errorMessage = errorData.message || 'Server error. Please try again later.';
            }
            break;
          default:
            errorMessage = errorData.message || `Failed to fetch files (Status: ${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const result: StorageListResponse = await response.json();
      console.log('Storage list fetched:', result);

      if (result.success && result.data) {
        if (reset) {
          setStorageData(result.data);
        } else {
          // Append for pagination
          setStorageData(prev => {
            if (!prev) return result.data;
            return {
              ...result.data,
              objects: [...prev.objects, ...result.data.objects],
              grouped: {
                builds: [...prev.grouped.builds, ...result.data.grouped.builds],
                deployments: [...prev.grouped.deployments, ...result.data.grouped.deployments],
                assets: [...prev.grouped.assets, ...result.data.grouped.assets],
                other: [...prev.grouped.other, ...result.data.grouped.other],
              },
            };
          });
        }
        setCurrentStartAfter(result.meta.nextStartAfter);
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('Failed to fetch storage files:', error);
      setStorageError(error.message || 'Failed to fetch files. Please try again.');
    } finally {
      setIsLoadingStorage(false);
    }
  };

  // Delete file function
  const deleteFile = async (file: StorageObject) => {
    if (!file || !file.key || !file.relativePath) {
      setDeleteError('Invalid file data. Cannot delete file.');
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(file.key));
    setDeleteError('');
    setDeleteSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Extract tenant ID from the file key
      const keyParts = file.key.split('/');
      const tenantId = keyParts[1]; // tenants/himanshubarnwal26_gmail_com-35aebtgz/...
      const objectPath = file.relativePath; // builds/build-123/source.rar

      if (!tenantId || !objectPath) {
        throw new Error('Invalid file path structure');
      }

      const response = await fetch(`http://localhost:8000/api/storage/object/${tenantId}/${objectPath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false, 
          error: 'Unknown error', 
          message: 'Failed to delete file' 
        }));
        
        let errorMessage = errorData.message || 'Failed to delete file';
        
        switch (response.status) {
          case 401:
            errorMessage = errorData.message || 'Invalid or missing authentication token. Please log in again.';
            break;
          case 403:
            errorMessage = errorData.message || 'Access denied. You do not have permission to delete this file.';
            break;
          case 404:
            errorMessage = errorData.message || 'File not found. It may have been already deleted.';
            break;
          case 500:
            // Check for specific 500 error types
            if (errorData.error === 'AWS configuration error') {
              errorMessage = errorData.message || 'S3 service not properly configured. Please contact support.';
            } else if (errorData.error === 'Database update failed') {
              errorMessage = errorData.message || 'File deleted from storage but database update failed. Please contact support for cleanup.';
            } else {
              errorMessage = errorData.message || 'Server error. Please try again later.';
            }
            break;
          default:
            errorMessage = errorData.message || `Failed to delete file (Status: ${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('File deleted successfully:', result);

      if (result.success) {
        setDeleteSuccess(`File "${file.relativePath.split('/').pop()}" deleted successfully`);
        
        // Remove the file from the current storage data
        setStorageData(prev => {
          if (!prev || !prev.objects || !prev.stats) return prev;
          
          const updatedObjects = prev.objects.filter(obj => obj.key !== file.key);
          const updatedGrouped = {
            builds: (prev.grouped?.builds || []).filter(obj => obj.key !== file.key),
            deployments: (prev.grouped?.deployments || []).filter(obj => obj.key !== file.key),
            assets: (prev.grouped?.assets || []).filter(obj => obj.key !== file.key),
            other: (prev.grouped?.other || []).filter(obj => obj.key !== file.key),
          };
          
          // Update stats
          const newTotalSize = Math.max(0, (prev.stats.totalSize || 0) - (file.size || 0));
          const newStats = {
            ...prev.stats,
            totalFiles: Math.max(0, (prev.stats.totalFiles || 0) - 1),
            totalSize: newTotalSize,
            totalSizeFormatted: formatFileSize(newTotalSize),
          };
          
          // Update category counts
          if (file.relativePath.includes('builds/')) newStats.builds = Math.max(0, (newStats.builds || 0) - 1);
          else if (file.relativePath.includes('deployments/')) newStats.deployments = Math.max(0, (newStats.deployments || 0) - 1);
          else if (file.relativePath.includes('assets/')) newStats.assets = Math.max(0, (newStats.assets || 0) - 1);
          else newStats.other = Math.max(0, (newStats.other || 0) - 1);
          
          return {
            ...prev,
            objects: updatedObjects,
            grouped: updatedGrouped,
            stats: newStats,
          };
        });

        // Clear success message after 3 seconds
        setTimeout(() => setDeleteSuccess(''), 3000);
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('Failed to delete file:', error);
      setDeleteError(error.message || 'Failed to delete file. Please try again.');
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.key);
        return newSet;
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (file: StorageObject) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
    setDeleteError('');
    setDeleteSuccess('');
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteFile(fileToDelete);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFileToDelete(null);
    setDeleteError('');
  };

  // Load files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');
    setSuccess('');

    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.rar')) {
      setError('Please select a RAR file containing your website.');
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const apiUrl = 'http://localhost:8000';

      const response = await fetch(`${apiUrl}/api/builds/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false, 
          error: 'Unknown error', 
          message: 'Upload failed' 
        }));
        
        // Handle specific error cases
        let errorMessage = errorData.message || 'Upload failed';
        
        switch (response.status) {
          case 400:
            errorMessage = errorData.message || 'Invalid file type. Only RAR files are allowed.';
            break;
          case 401:
            errorMessage = errorData.message || 'Authentication required. Please log in again.';
            break;
          case 404:
            errorMessage = errorData.message || 'No active tenant found. Please contact support.';
            break;
          case 413:
            errorMessage = errorData.message || 'File size exceeds maximum limit.';
            break;
          case 500:
            errorMessage = errorData.message || 'Build processing failed. Please try again.';
            break;
          default:
            errorMessage = errorData.message || `Upload failed with status ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Build upload successful:', result);

      // Handle successful response
      if (result.success && result.data && result.data.build) {
        const build = result.data.build;
        
        // Add to uploaded files list with build information
        const newFile: UploadedFile = {
          id: build.id,
          name: selectedFile.name,
          size: selectedFile.size,
          uploadedAt: build.createdAt,
          status: 'completed',
          url: undefined, // Build URL will be available after processing
        };

        setUploadedFiles(prev => [newFile, ...prev]);
        setSuccess(`Build queued successfully! Build ID: ${build.id}`);
        setSelectedFile(null);

        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Refresh the storage list to show the new upload
        fetchUploadedFiles();
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (contentType: string, relativePath: string) => {
    if (relativePath.includes('builds/')) {
      return <Package className="w-5 h-5 text-blue-400" />;
    } else if (relativePath.includes('deployments/')) {
      return <Globe className="w-5 h-5 text-green-400" />;
    } else if (contentType.includes('archive') || relativePath.endsWith('.rar') || relativePath.endsWith('.zip')) {
      return <FileArchive className="w-5 h-5 text-orange-400" />;
    } else {
      return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryLabel = (relativePath: string) => {
    if (relativePath.includes('builds/')) return 'Build';
    if (relativePath.includes('deployments/')) return 'Deployment';
    if (relativePath.includes('assets/')) return 'Asset';
    return 'Other';
  };

  const getCategoryColor = (relativePath: string) => {
    if (relativePath.includes('builds/')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (relativePath.includes('deployments/')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (relativePath.includes('assets/')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="text-gray-300 text-lg">
          Upload your website as a RAR file to start building
        </p>
      </div>

      {/* Upload Section */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CloudUpload className="w-5 h-5 mr-2" />
            Upload & Build Website
          </CardTitle>
          <CardDescription className="text-gray-300">
            Upload a RAR file containing your website files to start the build process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">{success}</AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <FileArchive className="w-full h-full" />
              </div>
              
              <div>
                <p className="text-gray-300 text-lg">
                  Drag and drop your RAR file here, or{' '}
                  <label htmlFor="file-upload" className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
                    browse
                  </label>
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  No file size restrictions
                </p>
              </div>

              <input
                id="file-upload"
                type="file"
                accept=".rar"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <Card className="border-gray-600 bg-gray-750">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileArchive className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <Button 
              onClick={uploadFile} 
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Build
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files from Storage */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Your Files</CardTitle>
              <CardDescription className="text-gray-300">
                Files uploaded to your storage - builds, deployments, and assets
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUploadedFiles()}
              disabled={isLoadingStorage}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isLoadingStorage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Storage Error */}
          {storageError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{storageError}</AlertDescription>
            </Alert>
          )}

          {/* Delete Error */}
          {deleteError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          {/* Delete Success */}
          {deleteSuccess && (
            <Alert variant="default" className="border-green-500 bg-green-500/10 mb-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">{deleteSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoadingStorage && !storageData && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-300">Loading files...</span>
            </div>
          )}

          {/* Storage Stats */}
          {storageData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-400">Total Files</div>
                <div className="text-xl font-semibold text-white">{storageData.stats.totalFiles}</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-400">Total Size</div>
                <div className="text-xl font-semibold text-white">{storageData.stats.totalSizeFormatted}</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-400">Builds</div>
                <div className="text-xl font-semibold text-blue-400">{storageData.stats.builds}</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-400">Deployments</div>
                <div className="text-xl font-semibold text-green-400">{storageData.stats.deployments}</div>
              </div>
            </div>
          )}

          {/* Files List */}
          {storageData && storageData.objects.length > 0 ? (
            <div className="space-y-3">
              {storageData.objects.map((file, index) => (
                <div key={`${file.key}-${index}`} className="flex items-center justify-between p-4 rounded-lg bg-gray-750 border border-gray-600 hover:border-gray-500 transition-colors">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(file.contentType, file.relativePath)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-white font-medium truncate">
                          {file.relativePath.split('/').pop() || file.relativePath}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(file.relativePath)}`}>
                          {getCategoryLabel(file.relativePath)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {file.relativePath}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {file.sizeFormatted} • {formatDate(file.lastModified)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(file)}
                      disabled={deletingFiles.has(file.key)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10 hover:text-red-300"
                    >
                      {deletingFiles.has(file.key) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {currentStartAfter && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchUploadedFiles(currentStartAfter, false)}
                    disabled={isLoadingStorage}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {isLoadingStorage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Files'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            !isLoadingStorage && !storageError && (
              <div className="text-center py-8">
                <FileArchive className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No files found</p>
                <p className="text-gray-500 text-sm">Upload your first file to get started</p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && fileToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Confirm Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete this file? This action cannot be undone.
              </p>
              <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center space-x-3">
                  {getFileIcon(fileToDelete.contentType, fileToDelete.relativePath)}
                  <div>
                    <p className="text-white font-medium">
                      {fileToDelete.relativePath.split('/').pop() || fileToDelete.relativePath}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {fileToDelete.sizeFormatted} • {getCategoryLabel(fileToDelete.relativePath)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
