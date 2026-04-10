import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import CourseView from './pages/CourseView';
import CourseBuilder from './pages/CourseBuilder';
import VideoStudio from './pages/VideoStudio';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import Pricing from './pages/Pricing';
import LearningPaths from './pages/LearningPaths';
import InstructorAnalytics from './pages/InstructorAnalytics';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="discover" element={<Marketplace />} />
                <Route path="paths" element={<LearningPaths />} />
                <Route path="course/:courseId" element={<CourseView />} />
                <Route path="build" element={<CourseBuilder />} />
                <Route path="analytics" element={<ProtectedRoute requiredRole="teacher"><InstructorAnalytics /></ProtectedRoute>} />
                <Route path="studio" element={<ProtectedRoute requiredRole="teacher"><VideoStudio /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
                <Route path="settings" element={<Settings />} />
                <Route path="pricing" element={<Pricing />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
