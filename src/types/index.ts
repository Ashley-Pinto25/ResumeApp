export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  uploadTime: Date;
  fileSize: number;
  driveFileId: string;
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis?: ResumeAnalysis;
}

export interface ResumeAnalysis {
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  suggestions: string[];
  overallScore: number;
  summary: string;
  analyzedAt: Date;
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  error?: string;
}
