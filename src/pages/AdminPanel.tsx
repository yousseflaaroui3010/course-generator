import { useState, useEffect } from 'react';
import { Activity, Users, Database, ShieldAlert, Cpu, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminPanel() {
  const { showToast } = useToast();
  const [statsData, setStatsData] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = () => {
    fetch('/api/stats')
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }
      })
      .then(data => setStatsData(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/clear-all', { method: 'POST' });
      if (res.ok) {
        showToast('All data cleared', 'success');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to clear data', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const stats = [
    { name: 'Total Users', value: statsData?.users || '...', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Active Courses', value: statsData?.courses || '...', icon: Database, change: '+5%', changeType: 'positive' },
    { name: 'AI Generations', value: statsData?.generations || '...', icon: Cpu, change: '+18%', changeType: 'positive' },
    { name: 'Failed Jobs', value: '0', icon: ShieldAlert, change: '0%', changeType: 'neutral' },
  ];

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Data"
        message="Are you sure you want to clear ALL data? This action is irreversible and will delete all courses, videos, and user progress."
        confirmLabel="Clear Everything"
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Administration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage users, monitor AI generation queues, and system health.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchStats}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={isClearing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white dark:bg-gray-900 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-sm rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                item.changeType === 'positive' ? 'text-green-600' : item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-gray-400" />
              System Health
            </h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              {[
                { label: 'API Server', status: 'Operational', color: 'bg-green-500' },
                { label: 'In-Memory Database', status: 'Operational', color: 'bg-green-500' },
                { label: 'AI Provider (Gemini)', status: 'Operational', color: 'bg-green-500' },
              ].map((service) => (
                <div key={service.label} className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{service.label}</dt>
                  <dd className="flex items-center text-sm text-gray-900 dark:text-white">
                    <span className={`w-2 h-2 rounded-full mr-2 ${service.color}`}></span>
                    {service.status}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Recent Generation Jobs */}
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Generation Jobs</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {[
              { id: 'job-1', type: 'Course', user: 'teacher@school.edu', status: 'Completed', time: '2 mins ago' },
              { id: 'job-2', type: 'Video', user: 'creator@org.com', status: 'Processing', time: '5 mins ago' },
            ].map((job) => (
              <li key={job.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{job.type} Generation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.user}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      job.status === 'Processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
