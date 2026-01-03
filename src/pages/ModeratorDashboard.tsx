// ModeratorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Shield,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Cpu,
  Zap,
  HardDrive,
  Activity,
  TrendingUp
} from 'lucide-react';

// Interfaces for the data we'll fetch
interface User {
  id: string;
  email: string;
}

interface UsersResponse {
  total_users: number;
  users: User[];
}

interface SystemStats {
  cpu_usage: number;
  gpu_usage: number;
  ram_usage: number;
  storage_usage: number;
  avg_response_time: number;
}

const ModeratorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = 'https://akhyar919-documind.hf.space';

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await getToken();

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch users and stats
      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/moderator/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/moderator/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const responses = [usersResponse, statsResponse];
      for (const response of responses) {
        if ([401, 403].includes(response.status)) {
          navigate('/documind'); // Redirect if not authorized
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const [usersDataResult, statsData] = await Promise.all([
        usersResponse.json(),
        statsResponse.json()
      ]);

      setUsersData(usersDataResult);
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load moderator data:', err);
      setError('Failed to load moderator data. The server might be unavailable or you may not have access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Loading and Error States
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Moderator Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button onClick={loadDashboardData} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold">DocuMind Moderator</h1>
                <p className="text-gray-400 text-sm">Content & User Oversight</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={loadDashboardData} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600" title="Refresh Data">
                <RefreshCw className="h-5 w-5" />
              </button>
              <button onClick={() => navigate('/documind')} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
                <LogOut className="h-4 w-4" />
                <span>Exit Panel</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Stats Overview */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'CPU Usage', value: stats.cpu_usage, icon: Cpu, unit: '%', color: 'blue' },
              { label: 'GPU Usage', value: stats.gpu_usage, icon: Zap, unit: '%', color: 'purple' },
              { label: 'RAM Usage', value: stats.ram_usage, icon: Activity, unit: '%', color: 'green' },
              { label: 'Storage', value: stats.storage_usage, icon: HardDrive, unit: '%', color: 'orange' },
              { label: 'Avg Response', value: stats.avg_response_time, icon: TrendingUp, unit: 'ms', color: 'cyan' }
            ].map((stat) => {
              const Icon = stat.icon;
              const getColorClasses = (value: number, unit: string) => {
                if (unit === 'ms') {
                  // For response time: green < 150ms, yellow 150-250ms, red > 250ms
                  if (value < 350) return 'text-green-400 bg-green-900/20';
                  if (value < 400) return 'text-yellow-400 bg-yellow-900/20';
                  return 'text-red-400 bg-red-900/20';
                }
                // For percentage: green < 60%, yellow 60-80%, red > 80%
                if (value < 60) return 'text-green-400 bg-green-900/20';
                if (value < 80) return 'text-yellow-400 bg-yellow-900/20';
                return 'text-red-400 bg-red-900/20';
              };

              const colorClasses = getColorClasses(stat.value, stat.unit);

              return (
                <div key={stat.label} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className={`text-2xl font-bold ${colorClasses.split(' ')[0]}`}>
                      {stat.value}{stat.unit}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <div className="mt-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${colorClasses.split(' ')[1]} transition-all duration-500`}
                      style={{ width: stat.unit === '%' ? `${stat.value}%` : `${Math.min((stat.value / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Users Section
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Registered Users</h2>
              {usersData && (
                <span className="text-2xl font-bold text-blue-400">
                  {usersData.total_users} {usersData.total_users === 1 ? 'User' : 'Users'}
                </span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {usersData?.users.map((user, index) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm text-gray-300">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{user.id.slice(0, 12)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </main>
    </div>
  );
};

export default ModeratorDashboard;
