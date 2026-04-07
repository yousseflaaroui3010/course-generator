import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import CourseBuilder from './pages/CourseBuilder';
import VideoStudio from './pages/VideoStudio';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="course/:courseId" element={<CourseView />} />
              <Route path="build" element={<CourseBuilder />} />
              <Route path="studio" element={<VideoStudio />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
