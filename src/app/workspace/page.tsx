'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertTriangle, 
  X
} from 'lucide-react';

export default function WorkspacePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setError('Please select a ZIP file');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadSuccess(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setError('Please select a ZIP file');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadSuccess(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadSuccess(true);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          const errorData = JSON.parse(xhr.responseText || '{}');
          setError(errorData.message || `Upload failed with status ${xhr.status}`);
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Network error occurred during upload');
        setUploading(false);
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/uploads`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Upload Your Website</h2>
        <p className="mt-2 text-gray-300">
          Upload a ZIP file containing your website files to deploy it instantly
        </p>
      </div>

      {/* Upload Section */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">File Upload</CardTitle>
          <CardDescription className="text-gray-300">
            Select or drag and drop a ZIP file containing your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <File className="mx-auto h-12 w-12 text-blue-400" />
                <div className="text-white font-medium">{selectedFile.name}</div>
                <div className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-white font-medium">
                  Choose a ZIP file or drag it here
                </div>
                <div className="text-gray-400 text-sm">
                  Maximum file size: 100MB
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Uploading...</span>
                <span className="text-gray-300">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                File uploaded successfully! Your website is being processed.
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <div className="flex justify-center">
            <Button
              onClick={uploadFile}
              disabled={!selectedFile || uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Website
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5 mr-3">
                1
              </div>
              <div>
                <strong>Prepare your website:</strong> Ensure your website files are organized with an index.html file as the entry point.
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5 mr-3">
                2
              </div>
              <div>
                <strong>Create ZIP file:</strong> Compress all your website files into a single ZIP archive.
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5 mr-3">
                3
              </div>
              <div>
                <strong>Upload:</strong> Select or drag your ZIP file to the upload area above.
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5 mr-3">
                4
              </div>
              <div>
                <strong>Deploy:</strong> Your website will be processed and deployed automatically.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}