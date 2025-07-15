import React, { useState } from 'react';
import { LogOut, Upload, FileText, User, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ResumeUpload } from './ResumeUpload';
import { ResumeList } from './ResumeList';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-xl sticky top-0 z-30 backdrop-blur transition-all border-b border-base-300">
        <div className="flex-1">
          <div className="flex items-center space-x-3 px-2">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-lg w-10 h-10 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CareerLift</h1>
            <div className="badge badge-sm badge-outline badge-accent">Beta</div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex-none">
          <div className="tabs tabs-lifted ml-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`tab tab-lg gap-2 ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
            >
              <FileText className="h-4 w-4" />
              My Resumes
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`tab tab-lg gap-2 ${activeTab === 'upload' ? 'tab-active' : ''}`}
            >
              <Upload className="h-4 w-4" />
              Upload New
            </button>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar ring ring-primary ring-offset-base-100 ring-offset-2">
              <div className="w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center shadow-inner">
                <User className="h-5 w-5" />
              </div>
            </label>
            <ul tabIndex={0} className="dropdown-content menu menu-sm z-[1] p-2 shadow-xl bg-base-100 rounded-box w-60 border border-base-300 mt-3">
              <div className="px-4 py-3 bg-base-200 rounded-t-box mb-2">
                <p className="text-xs font-medium text-base-content/70">Signed in as</p>
                <p className="text-sm font-bold text-base-content truncate">{user?.email}</p>
              </div>
              <div className="px-2">
                <div className="divider my-1"></div>
                <li>
                  <button onClick={handleLogout} className="text-error hover:bg-error/10 font-medium">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' ? (
          <div className="max-w-2xl mx-auto">
            <div className="hero mb-8">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <div className="flex flex-col items-center">
                    <span className="badge badge-lg badge-accent mb-4">AI-POWERED ANALYSIS</span>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      Upload Your Resume
                    </h2>
                    <p className="text-base-content/70 mt-2">
                      Get detailed feedback and improve your career prospects with our AI assistant
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ResumeUpload onUploadComplete={handleUploadComplete} />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="card bg-base-100 shadow-xl border border-base-300 bg-opacity-70 backdrop-blur">
                    <div className="card-body">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <span className="badge badge-lg badge-outline badge-primary mb-2">Dashboard</span>
                          <h2 className="card-title text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Resume Management</h2>
                          <p className="text-base-content/70 mt-2">
                            Track, manage, and improve your professional documents with AI assistance
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="stats shadow-xl bg-base-100 border border-base-300 w-full">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-md w-12 h-12 flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                      <div className="stat-title font-medium">Total Resumes</div>
                      <div className="stat-value text-primary">3</div>
                      <div className="stat-desc mt-1">
                        <div className="badge badge-outline badge-xs">Last updated today</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ResumeList refreshTrigger={refreshTrigger} />
          </div>
        )}
      </main>
    </div>
  );
};
