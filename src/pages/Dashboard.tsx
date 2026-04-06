import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Plus } from 'lucide-react';

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }
      })
      .then(data => {
        setCourses(data.courses || []);
        setVideos(data.videos || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Student</h1>
        <div className="flex space-x-4">
          <Link
            to="/build"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
              Continue Learning
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="p-6 text-center text-gray-500">Loading courses...</li>
            ) : courses.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No courses generated yet.</li>
            ) : (
              courses.map((course) => (
                <li key={course.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <Link to={`/course/${course.id}`} className="block">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium text-gray-900">{course.title}</h3>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.lastAccessed}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{course.progress}% complete</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <PlayCircle className="w-5 h-5 mr-2 text-rose-500" />
              Recent Videos
            </h2>
            <Link to="/studio" className="text-sm text-rose-600 hover:text-rose-500 font-medium">Go to Studio</Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="p-6 text-center text-gray-500">Loading videos...</li>
            ) : videos.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No videos generated yet.</li>
            ) : (
              videos.map((video) => (
                <li key={video.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center relative overflow-hidden">
                      <PlayCircle className="w-8 h-8 text-white opacity-80" />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-[10px] px-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{video.status}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
