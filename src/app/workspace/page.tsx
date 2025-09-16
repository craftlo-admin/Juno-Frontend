'use client';

import { useState, useCallback } from 'react';
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
  CloudUpload
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

export default function WorkspacePage() {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

      {/* Uploaded Files History */}
      {uploadedFiles.length > 0 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Build History</CardTitle>
            <CardDescription className="text-gray-300">
              Your recently uploaded and built websites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-750 border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <FileArchive className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {file.url && (
                      <Button variant="outline" size="sm" asChild className="border-gray-600 text-gray-300">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
