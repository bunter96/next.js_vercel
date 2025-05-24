// pages/admin/analytics.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { databases } from '@/lib/appwriteConfig';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { MdPeople, MdMic, MdAttachMoney, MdError } from 'react-icons/md';
import Link from 'next/link';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalConversions: 0,
    revenue: 0,
    errorRate: 0,
    newUsersData: [],
    dailyConversionsData: [],
    voiceDistribution: [],
    topUsers: [],
  });
  const [timeRange, setTimeRange] = useState('30days');
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/'); // Redirect non-admins to homepage
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    setFetchLoading(true);
    try {
      const databaseId = '67fecfed002f909fc072';
      const collectionId = '67fecffb00075d13ade6';
      const response = await databases.listDocuments(databaseId, collectionId);

      // Mock data for analytics (replace with real data from conversions collection)
      const users = response.documents;
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.char_remaining < u.char_allowed).length;
      const totalConversions = users.reduce((sum, u) => sum + (u.char_allowed - u.char_remaining), 0) / 100; // Mock: 100 chars = 1 conversion
      const revenue = users.filter(u => u.current_active_plan !== 'free').length * 10; // Mock: $10 per paid user
      const errorRate = 2; // Mock: 2% error rate

      // Mock chart data
      const newUsersData = Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        count: Math.floor(Math.random() * 10),
      }));
      const dailyConversionsData = Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        count: Math.floor(Math.random() * 50),
      }));
      const voiceDistribution = [
        { voice: 'English (US)', count: 60 },
        { voice: 'Spanish', count: 20 },
        { voice: 'French', count: 15 },
        { voice: 'Other', count: 5 },
      ];
      const topUsers = users
        .sort((a, b) => (b.char_allowed - b.char_remaining) - (a.char_allowed - a.char_remaining))
        .slice(0, 5)
        .map(u => ({
          name: u.name || u.user_email,
          conversions: (u.char_allowed - u.char_remaining) / 100,
        }));

      setAnalyticsData({
        totalUsers,
        totalConversions,
        revenue,
        errorRate,
        newUsersData,
        dailyConversionsData,
        voiceDistribution,
        topUsers,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Chart configurations
  const newUsersChart = {
    labels: analyticsData.newUsersData.map(d => d.date),
    datasets: [{
      label: 'New Users',
      data: analyticsData.newUsersData.map(d => d.count),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
    }],
  };

  const dailyConversionsChart = {
    labels: analyticsData.dailyConversionsData.map(d => d.date),
    datasets: [{
      label: 'Conversions',
      data: analyticsData.dailyConversionsData.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }],
  };

  const voiceDistributionChart = {
    labels: analyticsData.voiceDistribution.map(v => v.voice),
    datasets: [{
      label: 'Voice Distribution',
      data: analyticsData.voiceDistribution.map(v => v.count),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'],
    }],
  };

  if (loading || fetchLoading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow flex items-center">
          <MdPeople className="w-10 h-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{analyticsData.totalUsers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center">
          <MdMic className="w-10 h-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Conversions</p>
            <p className="text-2xl font-bold text-gray-800">{analyticsData.totalConversions}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center">
          <MdAttachMoney className="w-10 h-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-800">${analyticsData.revenue}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center">
          <MdError className="w-10 h-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-2xl font-bold text-gray-800">{analyticsData.errorRate}%</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">New Users Over Time</h3>
          <Line data={newUsersChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Conversions</h3>
          <Bar data={dailyConversionsChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Voices</h3>
        <div className="max-w-xs mx-auto">
          <Pie data={voiceDistributionChart} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Top Active Users</h3>
          <Link href="/admin/users">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">View All Users</button>
          </Link>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500">
              <th className="pb-2">User</th>
              <th className="pb-2">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.topUsers.map((u, i) => (
              <tr key={i} className="border-t">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}