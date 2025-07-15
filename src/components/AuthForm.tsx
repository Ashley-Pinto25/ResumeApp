import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<AuthFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: AuthFormData) => {
    try {
      setLoading(true);
      setError('');
      
      if (isLogin) {
        const result = await authService.login(data.email, data.password);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } else {
        const result = await authService.register(data.email, data.password);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="grid md:grid-cols-5 max-w-5xl w-full gap-6">
        <div className="md:col-span-2 hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-primary to-secondary rounded-box text-primary-content">
          <div className="mb-8">
            <div className="badge badge-outline badge-lg mb-2">NEW</div>
            <h2 className="text-3xl font-extrabold">CareerLift</h2>
            <p className="opacity-90 mt-1">AI-powered career advancement</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">AI Resume Analysis</h3>
                <p className="text-sm opacity-90">Get detailed feedback on your resume instantly</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Smart Suggestions</h3>
                <p className="text-sm opacity-90">Personalized advice to improve your chances</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">Career Tracking</h3>
                <p className="text-sm opacity-90">Track your progress over multiple versions</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 card bg-base-100 shadow-2xl border border-base-200">
          <div className="card-body p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="avatar placeholder mb-4 md:hidden">
                <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-xl w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
              <p className="text-base-content/70 mt-2">
                {isLogin ? 'Sign in to access your career dashboard' : 'Create an account to analyze your resume'}
              </p>
            </div>

            {error && (
              <div className="alert alert-error shadow-lg mb-6">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Authentication Error</h3>
                    <div className="text-xs">{error}</div>
                  </div>
                </div>
                <div className="flex-none">
                  <button className="btn btn-sm btn-ghost" onClick={() => setError('')}>Dismiss</button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className={`input input-bordered w-full ${errors.email ? 'input-error' : 'focus:input-primary'}`}
                  />
                </div>
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Password Field */}
              <div className="form-control">
                <div className="flex justify-between items-center">
                  <label className="label py-1">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Password
                    </span>
                  </label>
                  {isLogin && (
                    <label className="label py-1">
                      <a href="#" className="label-text-alt link link-hover text-primary">Forgot password?</a>
                    </label>
                  )}
                </div>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input input-bordered w-full ${errors.password ? 'input-error' : 'focus:input-primary'}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-base-content/40 hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Confirm Password Field (Registration only) */}
              {!isLogin && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Confirm Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : 'focus:input-primary'}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.confirmPassword.message}
                      </span>
                    </label>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block btn-lg shadow-lg"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : isLogin ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sign In
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
                
                {/* Divider */}
                <div className="divider text-base-content/30 text-xs font-medium">OR</div>
                
                {/* Toggle Login/Register */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      reset();
                      setError('');
                    }}
                    className="btn btn-outline btn-block"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up now"
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
