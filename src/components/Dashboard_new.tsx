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
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CareerLift</h1>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex-none">
          <div className="tabs tabs-boxed mr-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`tab gap-2 ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
            >
              <FileText className="h-4 w-4" />
              My Resumes
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`tab gap-2 ${activeTab === 'upload' ? 'tab-active' : ''}`}
            >
              <Upload className="h-4 w-4" />
              Upload New
            </button>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>Signed in as</span>
              </li>
              <li><a className="text-sm">{user?.email}</a></li>
              <li><hr /></li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </li>
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
                  <h2 className="text-3xl font-bold text-base-content">Upload Your Resume</h2>
                  <p className="text-base-content/70 mt-2">
                    Get AI-powered feedback and improve your career prospects
                  </p>
                </div>
              </div>
            </div>
            <ResumeUpload onUploadComplete={handleUploadComplete} />
          </div>
        ) : (
          <div>
            <div className="hero mb-8">
              <div className="hero-content">
                <div className="flex w-full justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-base-content">Resume Dashboard</h2>
                    <p className="text-base-content/70 mt-1">
                      Manage your resumes and view AI analysis results
                    </p>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="stat-title">Total Resumes</div>
                      <div className="stat-value text-primary">3</div>
                      <div className="stat-desc">All time uploads</div>
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
