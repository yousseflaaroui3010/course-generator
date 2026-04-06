import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import CourseBuilder from './pages/CourseBuilder';
import VideoStudio from './pages/VideoStudio';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="course/:courseId" element={<CourseView />} />
          <Route path="build" element={<CourseBuilder />} />
          <Route path="studio" element={<VideoStudio />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
