import { useState, useEffect } from 'react';
import { Activity, Users, Database, ShieldAlert, Cpu } from 'lucide-react';

export default function AdminPanel() {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
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
  }, []);

  const stats = [
    { name: 'Total Users', value: statsData?.users || '...', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Active Courses', value: statsData?.courses || '...', icon: Database, change: '+5%', changeType: 'positive' },
    { name: 'AI Generations', value: statsData?.generations || '...', icon: Cpu, change: '+18%', changeType: 'positive' },
    { name: 'Failed Jobs', value: '0', icon: ShieldAlert, change: '0%', changeType: 'neutral' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Administration</h1>
        <p className="mt-1 text-sm text-gray-500">Manage users, monitor AI generation queues, and system health.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
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
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
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
                  <dt className="text-sm font-medium text-gray-500">{service.label}</dt>
                  <dd className="flex items-center text-sm text-gray-900">
                    <span className={`w-2 h-2 rounded-full mr-2 ${service.color}`}></span>
                    {service.status}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Recent Generation Jobs */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Generation Jobs</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {[
              { id: 'job-1', type: 'Course', user: 'teacher@school.edu', status: 'Completed', time: '2 mins ago' },
              { id: 'job-2', type: 'Video', user: 'creator@org.com', status: 'Processing', time: '5 mins ago' },
            ].map((job) => (
              <li key={job.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600 truncate">{job.type} Generation</p>
                    <p className="text-sm text-gray-500">{job.user}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{job.time}</p>
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
