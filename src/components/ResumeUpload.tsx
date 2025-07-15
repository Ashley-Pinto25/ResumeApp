import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { resumeService } from '../services/resumeService';
import { geminiService } from '../services/geminiService';
import { pdfUtils } from '../utils/pdfUtils';
import type { UploadProgress } from '../types';

interface ResumeUploadProps {
  onUploadComplete: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    
    const validation = pdfUtils.validatePDFFile(selectedFile);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setError('');
    setUploadProgress({ progress: 0, status: 'uploading' });
    
    try {
      // Upload file to Firebase Storage
      const uploadResult = await resumeService.uploadResume(
        file,
        user.uid,
        setUploadProgress
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      // Extract text from PDF for analysis
      setUploadProgress({ progress: 50, status: 'analyzing' });
      const resumeText = await pdfUtils.extractTextFromPDF(file);
      
      // Analyze with Gemini AI
      const analysis = await geminiService.analyzeResume(resumeText);
      
      // Update resume with analysis
      if (uploadResult.resumeId) {
        await resumeService.updateResumeAnalysis(uploadResult.resumeId, analysis);
      }
      
      setUploadProgress({ progress: 100, status: 'completed' });
      
      // Reset form
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      // Notify parent component
      onUploadComplete();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setUploadProgress({ progress: 0, status: 'error', error: errorMessage });
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setUploadProgress(null);
    if (inputRef.current) {
      inputRef.current.value = '';
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
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-2xl text-base-content mb-2">Get Your Resume Analyzed</h2>
        <p className="mb-6 text-base-content/70">Our AI will provide detailed feedback on your resume</p>
        
        {!file ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-primary bg-primary/10 shadow-lg transform scale-[1.01]'
                : 'border-base-300 hover:border-base-content/20 hover:bg-base-200/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="avatar placeholder mb-4">
              <div className={`bg-base-300 text-base-content rounded-lg w-20 h-20 transition-colors ${
                dragActive ? 'bg-primary/20 text-primary' : ''
              }`}>
                <Upload className="h-10 w-10" />
              </div>
            </div>
            
            <p className="text-lg font-bold text-base-content mb-2">
              Drag and drop your resume here
            </p>
            <p className="text-sm text-base-content/70 mb-4">
              or click to select a file
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="btn btn-primary btn-md"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select PDF File
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            
            <div className="mt-6 flex justify-center items-center gap-1 text-xs">
              <div className="badge badge-neutral badge-sm">PDF</div>
              <span className="text-base-content/50">files only, max 10MB</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card bg-base-200 border border-base-300 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="avatar placeholder">
                      <div className="bg-error/10 text-error rounded-lg w-12 h-12 flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base-content truncate">{file.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="badge badge-sm">{formatFileSize(file.size)}</div>
                        <p className="text-xs text-base-content/70">PDF Document</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:bg-error/10 hover:text-error"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {uploadProgress && (
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {uploadProgress.status === 'uploading' && (
                        <span className="loading loading-spinner loading-sm text-primary"></span>
                      )}
                      {uploadProgress.status === 'analyzing' && (
                        <span className="loading loading-dots loading-sm text-secondary"></span>
                      )}
                      {uploadProgress.status === 'completed' && (
                        <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {uploadProgress.status === 'error' && (
                        <svg className="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className="font-medium">
                        {uploadProgress.status === 'uploading' && 'Uploading to secure storage...'}
                        {uploadProgress.status === 'analyzing' && 'AI analyzing your resume...'}
                        {uploadProgress.status === 'completed' && 'Analysis Complete!'}
                        {uploadProgress.status === 'error' && 'Error Processing'}
                      </span>
                    </div>
                    <div className="badge badge-primary badge-outline">{uploadProgress.progress}%</div>
                  </div>
                  
                  <div className="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 transition-all duration-500 ease-out ${
                        uploadProgress.status === 'error' ? 'bg-error' : 
                        uploadProgress.status === 'analyzing' ? 'bg-gradient-to-r from-primary to-secondary' :
                        uploadProgress.status === 'completed' ? 'bg-success' : 'bg-primary'
                      }`} 
                      style={{ width: `${uploadProgress.progress}%` }}
                    ></div>
                  </div>
                  
                  {uploadProgress.status === 'analyzing' && (
                    <p className="text-xs text-base-content/70">
                      Our AI is analyzing your resume for structure, content, keywords and more...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={!file || (uploadProgress !== null && uploadProgress.status !== 'error')}
              className={`btn btn-block ${uploadProgress?.status === 'completed' ? 'btn-success' : 'btn-primary'}`}
            >
              {uploadProgress?.status === 'uploading' && (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading Resume...
                </>
              )}
              {uploadProgress?.status === 'analyzing' && (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  AI Analysis in Progress...
                </>
              )}
              {uploadProgress?.status === 'completed' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  View Results
                </>
              )}
              {!uploadProgress && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Upload & Get AI Analysis
                </>
              )}
              {uploadProgress?.status === 'error' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Upload
                </>
              )}
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-4">
            <div className="alert alert-error shadow-lg">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Upload Error</h3>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setError('')}>Dismiss</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
