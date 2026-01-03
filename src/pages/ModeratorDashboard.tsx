// ModeratorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Users, 
    Clock, 
    FileText, 
    Shield,
    LogOut,
    RefreshCw,
    AlertTriangle,
    Search,
    Download,
    UserCheck,
    UserX,
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
  lastActive: string;
  documentCount: number;
  isActive: boolean;
}

interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  fileCount: number;
  isExpired: boolean;
}

interface Document {
  id: number;
  filename: string;
  user_id: string;
  created_at: string;
  status: string;
  document_type: string;
  chunk_count: number;
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
  const [activeTab, setActiveTab] = useState('users'); // Default to users tab
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
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

      // Fetch all data in parallel
      const [usersResponse, sessionsResponse, docsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/moderator/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/moderator/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/moderator/documents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/moderator/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const responses = [usersResponse, sessionsResponse, docsResponse, statsResponse];
      for (const response of responses) {
          if ([401, 403].includes(response.status)) {
              navigate('/documind'); // Redirect if not authorized
              return;
          }
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
      }

      const [usersData, sessionsData, docsData, statsData] = await Promise.all([
        usersResponse.json(),
        sessionsResponse.json(),
        docsResponse.json(),
        statsResponse.json()
      ]);

      setUsers(usersData);
      setSessions(sessionsData);
      setDocuments(docsData);
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

  const formatSimpleDate = (isoString: string) => new Date(isoString).toLocaleDateString();

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

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'users', name: 'Users', icon: Users },
              { id: 'documents', name: 'Documents', icon: FileText },
              { id: 'sessions', name: 'Sessions', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

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
                  if (value < 150) return 'text-green-400 bg-green-900/20';
                  if (value < 250) return 'text-yellow-400 bg-yellow-900/20';
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
             <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{user.email}</div>
                        <div className="text-sm text-gray-400">ID: {user.id.slice(0, 12)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatSimpleDate(user.lastActive)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{user.documentCount}</td>
                      <td className="px-6 py-4">
                        {user.isActive ? <UserCheck className="h-5 w-5 text-green-500" /> : <UserX className="h-5 w-5 text-red-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
           <div className="bg-gray-800 rounded-xl overflow-hidden">
             <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">Document Oversight</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Filename</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Chunks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 font-medium">{doc.filename}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{doc.user_id.slice(0,12)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatSimpleDate(doc.created_at)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${doc.status === 'completed' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>{doc.status}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-300">{doc.chunk_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
           <div className="bg-gray-800 rounded-xl overflow-hidden">
             <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">Recent Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Session ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Files</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 font-mono text-sm">{session.id.slice(0, 12)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{session.userId.slice(0, 12)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{new Date(session.expiresAt).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{session.fileCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ModeratorDashboard;
