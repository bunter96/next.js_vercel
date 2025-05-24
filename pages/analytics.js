import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { databases, Query } from '@/lib/appwriteConfig';
import { Home, BarChart2 } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Link from 'next/link';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Analytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState({
    audioGenerations: [],
    voicesCloned: [],
    charAllowed: 0,
    charRemaining: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        setIsLoading(true);

        // Calculate date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        // Fetch user profile for char_allowed and char_remaining
        const profileResponse = await databases.getDocument(
          '67fecfed002f909fc072',
          '67fecffb00075d13ade6',
          user.$id
        );
        const charAllowed = profileResponse.char_allowed || 0;
        const charRemaining = profileResponse.char_remaining || 0;
        console.log('user_profiles query response:', profileResponse);

        // Fetch audio generations from History collection
        const historyResponse = await databases.listDocuments(
          '67fecfed002f909fc072',
          '680e9bf90014579d3f5b', // Replace with actual History collection ID
          [
            Query.equal('userId', user.$id),
            Query.greaterThan('$createdAt', startDate.toISOString()),
          ]
        );
        console.log('History query response:', historyResponse);

        // Group audio generations by day
        const audioGenerations = Array(30).fill(0);
        historyResponse.documents.forEach(doc => {
          const createdAt = new Date(doc.$createdAt);
          const daysDiff = Math.floor((endDate - createdAt) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff < 30) {
            audioGenerations[29 - daysDiff] += 1;
          }
        });

        // Fetch cloned voices from user_models collection
        const modelsResponse = await databases.listDocuments(
          '67fecfed002f909fc072',
          '680431be00081ea103d1', // Replace with actual user_models collection ID
          [
            Query.equal('userId', user.$id),
            Query.greaterThan('$createdAt', startDate.toISOString()),
          ]
        );
        console.log('user_models query response:', modelsResponse);

        // Group voices cloned by day
        const voicesCloned = Array(30).fill(0);
        modelsResponse.documents.forEach(doc => {
          const createdAt = new Date(doc.$createdAt);
          const daysDiff = Math.floor((endDate - createdAt) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff < 30) {
            voicesCloned[29 - daysDiff] += 1;
          }
        });

        setAnalyticsData({
          audioGenerations,
          voicesCloned,
          charAllowed,
          charRemaining,
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(`Failed to load analytics data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  // Generate date labels (last 30 days)
  const dateLabels = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Bar chart data for audio generations
  const audioChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Audio Generations',
        data: analyticsData.audioGenerations,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for voices cloned
  const voicesChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Voices Cloned',
        data: analyticsData.voicesCloned,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Doughnut chart data for Usage Progress
  const doughnutChartData = {
    labels: ['Characters Used', 'Characters Remaining'],
    datasets: [
      {
        data: [
          analyticsData.charAllowed - analyticsData.charRemaining,
          analyticsData.charRemaining,
        ],
        backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasActivityData =
    analyticsData.audioGenerations.some(count => count > 0) ||
    analyticsData.voicesCloned.some(count => count > 0);
  const hasUsageData = analyticsData.charAllowed > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Your Analytics</h1>
        </div>
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>

      {!hasActivityData && !hasUsageData ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 text-lg">No analytics data available. Try generating audio or cloning voices to see your stats!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Audio Generations Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Audio Generations</h2>
            {analyticsData.audioGenerations.every(count => count === 0) ? (
              <p className="text-gray-600 text-center">No audio generations in the last 30 days.</p>
            ) : (
              <>
                <div className="h-64">
                  <Bar data={audioChartData} options={chartOptions} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Total: {analyticsData.audioGenerations.reduce((sum, count) => sum + count, 0)} audio generations
                </p>
              </>
            )}
          </div>

          {/* Voices Cloned Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Voices Cloned</h2>
            {analyticsData.voicesCloned.every(count => count === 0) ? (
              <p className="text-gray-600 text-center">No voices cloned in the last 30 days.</p>
            ) : (
              <>
                <div className="h-64">
                  <Bar data={voicesChartData} options={chartOptions} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Total: {analyticsData.voicesCloned.reduce((sum, count) => sum + count, 0)} voices cloned
                </p>
              </>
            )}
          </div>

          {/* Usage Progress Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Usage Progress</h2>
            {analyticsData.charAllowed === 0 ? (
              <p className="text-gray-600 text-center">No character quota available.</p>
            ) : (
              <>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={doughnutChartData} options={{ ...chartOptions, scales: undefined }} />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {analyticsData.charRemaining.toLocaleString()} / {analyticsData.charAllowed.toLocaleString()} characters remaining
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}