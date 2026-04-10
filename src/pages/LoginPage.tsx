import React from 'react';
import { LogIn, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();

  const [selectedRole, setSelectedRole] = React.useState<'student' | 'teacher'>('student');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900">
      {/* Left Side - Hero */}
      <div className="lg:w-1/2 bg-indigo-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EduGen AI</span>
          </div>
          
          <h1 className="text-5xl font-black leading-tight mb-6">
            The Future of <br />
            <span className="text-indigo-200">Personalized Learning</span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-md leading-relaxed">
            Generate custom courses, interactive videos, and personalized study paths with the power of AI.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">AI Powered</h3>
              <p className="text-sm text-indigo-100">Content tailored to your level</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Secure</h3>
              <p className="text-sm text-indigo-100">Your data, protected by Firebase</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to access your personalized learning dashboard</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                onClick={() => setSelectedRole('student')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  selectedRole === 'student'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                I'm a Student
              </button>
              <button
                onClick={() => setSelectedRole('teacher')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  selectedRole === 'teacher'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                I'm an Instructor
              </button>
            </div>

            <button
              onClick={() => signIn(selectedRole)}
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-800 text-lg font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-4" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">Secure Authentication</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
