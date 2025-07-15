import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, Download, Trash2, BarChart3, Star, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { resumeService } from '../services/resumeService';
import type { Resume } from '../types';

interface ResumeListProps {
  refreshTrigger: number;
}

export const ResumeList: React.FC<ResumeListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const loadResumes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userResumes = await resumeService.getUserResumes(user.uid);
      setResumes(userResumes);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user, refreshTrigger, loadResumes]);

  const handleDelete = async (resumeId: string, driveFileId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await resumeService.deleteResume(resumeId, driveFileId);
      setResumes(resumes.filter(r => r.id !== resumeId));
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      const url = await resumeService.getResumeUrl(resume.driveFileId);
      if (url) {
        window.open(url, '_blank');
      } else {
        console.error('Could not get download URL');
      }
    } catch (error) {
      console.error('Error getting download URL:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: Resume['analysisStatus']) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'analyzing': return 'badge-info';
      case 'error': return 'badge-error';
      default: return 'badge-warning';
    }
  };

  const getStatusText = (status: Resume['analysisStatus']) => {
    switch (status) {
      case 'completed': return 'Analyzed';
      case 'analyzing': return 'Analyzing';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="hero min-h-[400px]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <FileText className="h-16 w-16 text-base-content/40 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-base-content mb-2">No resumes uploaded yet</h3>
            <p className="text-base-content/70">Upload your first resume to get started with AI analysis</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <div key={resume.id} className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="avatar placeholder">
                    <div className="bg-error text-error-content rounded-lg w-12">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="card-title text-base text-base-content truncate">
                      {resume.originalName}
                    </h3>
                    <p className="text-sm text-base-content/70">{formatFileSize(resume.fileSize)}</p>
                  </div>
                </div>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button onClick={() => handleDownload(resume)} className="text-info">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleDelete(resume.id, resume.driveFileId)} className="text-error">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-base-content/70">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(resume.uploadTime)}</span>
                </div>
                <div className={`badge ${getStatusColor(resume.analysisStatus)}`}>
                  {getStatusText(resume.analysisStatus)}
                </div>
              </div>
              
              {resume.analysis && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content">Overall Score:</span>
                    <span className={`font-bold text-xl ${getScoreColor(resume.analysis.overallScore)}`}>
                      {resume.analysis.overallScore}/100
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => {
                        setSelectedResume(resume);
                        setShowAnalysis(true);
                      }}
                      className="btn btn-primary btn-block btn-sm"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Modal */}
      {showAnalysis && selectedResume && selectedResume.analysis && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-base-content">Resume Analysis</h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="btn btn-ghost btn-circle"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-base-content mb-2">{selectedResume.originalName}</h3>
              <div className="flex items-center space-x-4 text-sm text-base-content/70">
                <span>Analyzed on {formatDate(selectedResume.analysis.analyzedAt)}</span>
                <div className={`badge badge-lg ${getScoreColor(selectedResume.analysis.overallScore).replace('text-', 'badge-')}`}>
                  Score: {selectedResume.analysis.overallScore}/100
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="alert alert-info">
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p>{selectedResume.analysis.summary}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card bg-success/10 border border-success/20">
                  <div className="card-body">
                    <h4 className="card-title text-success flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {selectedResume.analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-base-content flex items-start">
                          <span className="mr-2">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="card bg-error/10 border border-error/20">
                  <div className="card-body">
                    <h4 className="card-title text-error flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {selectedResume.analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-base-content flex items-start">
                          <span className="mr-2">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card bg-warning/10 border border-warning/20">
                  <div className="card-body">
                    <h4 className="card-title text-warning">Missing Sections</h4>
                    <ul className="space-y-2">
                      {selectedResume.analysis.missingSections.map((section, index) => (
                        <li key={index} className="text-base-content flex items-start">
                          <span className="mr-2">•</span>
                          <span>{section}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="card bg-secondary/10 border border-secondary/20">
                  <div className="card-body">
                    <h4 className="card-title text-secondary">Suggestions</h4>
                    <ul className="space-y-2">
                      {selectedResume.analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-base-content flex items-start">
                          <span className="mr-2">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowAnalysis(false)}>close</button>
          </form>
        </div>
      )}
    </div>
  );
};
