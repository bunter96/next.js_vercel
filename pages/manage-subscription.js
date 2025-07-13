import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ManageSubscription() {
  const { user, loading, refreshUser } = useAuth();
  const [portalUrl, setPortalUrl] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [isGeneratingPortal, setIsGeneratingPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Load subscription data
  useEffect(() => {
    if (user && user.creem_customer_id) {
      fetch(`/api/subscriptions-appwrite?user_id=${user.$id}`)
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.error || 'Unknown error');
            });
          }
          return res.json();
        })
        .then(data => {
          setSubscription(data);
          setLoadingSub(false);
        })
        .catch(err => {
          console.error('Subscription fetch error:', err.message);
          setApiError('Failed to load subscription details');
          setLoadingSub(false);
        });
    } else {
      setLoadingSub(false);
    }
  }, [user]);

  // Handle Manage Subscription button click
  const handleManageSubscription = async () => {
    if (!user.creem_customer_id) {
      setApiError('No customer ID available');
      return;
    }

    setIsGeneratingPortal(true);
    setApiError(null);
    try {
      console.log('Fetching portal URL for customerId:', user.creem_customer_id);
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.creem_customer_id }),
      });
      const data = await res.json();

      console.log('Customer portal response:', JSON.stringify(data, null, 2));

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate customer portal URL');
      }

      if (!data.portalUrl) {
        throw new Error('No portal URL returned from API');
      }

      console.log('Opening portalUrl:', data.portalUrl);
      setPortalUrl(data.portalUrl);
      window.open(data.portalUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Customer portal error:', err.message);
      setApiError(`Failed to generate customer portal link: ${err.message}`);
    } finally {
      setIsGeneratingPortal(false);
    }
  };

  // Handle Cancel Subscription button click
  const handleCancelSubscription = async () => {
    if (!user.creem_subscription_id) {
      setApiError('No subscription ID available');
      return;
    }

    setIsCanceling(true);
    setApiError(null);
    try {
      console.log('Canceling subscription:', user.creem_subscription_id);
      const cancelRes = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: user.creem_subscription_id }),
      });
      const cancelData = await cancelRes.json();

      if (!cancelRes.ok || cancelData.error) {
        throw new Error(cancelData.error || 'Failed to cancel subscription');
      }

      console.log('Cancellation response:', JSON.stringify(cancelData, null, 2));

      // Delete the subscription document and update user profile
      const deleteRes = await fetch('/api/delete-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.$id }),
      });
      const deleteData = await deleteRes.json();

      if (!deleteRes.ok || deleteData.error) {
        throw new Error(deleteData.error || 'Failed to delete subscription document or update user profile');
      }

      console.log('Delete subscription response:', JSON.stringify(deleteData, null, 2));

      // Clear the subscription state and refresh user data
      setSubscription(null);

      // Refresh user data to reflect updated creem_customer_id
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Cancel subscription error:', err.message);
      setApiError(`Failed to cancel subscription: ${err.message}`);
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading || loadingSub)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading subscription...</p>
      </div>
    );

  if (!user)
    return (
      <div className="text-center text-red-600 text-lg font-medium mt-10">
        Please log in to view your subscriptions.
      </div>
    );

  if (apiError)
    return (
      <div className="text-center text-red-600 text-lg font-medium mt-10">
        <p>{apiError}</p>
        {portalUrl && (
          <p className="mt-4">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Click here to visit the customer portal manually
            </a>
          </p>
        )}
      </div>
    );

	if (!user.creem_customer_id)
	  return (
		<div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
		  <div className="max-w-md mx-auto text-center">
			<div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
			  <div className="flex justify-center mb-6">
				<svg
				  xmlns="http://www.w3.org/2000/svg"
				  className="h-16 w-16 text-gray-400"
				  fill="none"
				  viewBox="0 0 24 24"
				  stroke="currentColor"
				>
				  <path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
				  />
				</svg>
			  </div>
			  <h2 className="text-2xl font-bold text-gray-800 mb-3">
				No Active Subscription
			  </h2>
				<p className="text-gray-600 mb-6">
				  You don&apos;t have any active subscriptions. Explore our plans to unlock premium features.
				</p>
			  <button
				onClick={() => window.location.href = '/pricing'}
				className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium bg-gradient-to-r from-indigo-600 to-purple-600"
			  >
				View Pricing Plans
			  </button>
			</div>
		  </div>
		</div>
	  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Your Subscription
        </h1>

        {subscription ? (
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {subscription.plan_name || 'Not available'}
              </h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {subscription.status || 'Unknown'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Created At</p>
                    <p className="text-gray-900 font-medium">
                      {subscription.created_at
                        ? new Date(subscription.created_at * 1000).toLocaleDateString()
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Period Start</p>
                    <p className="text-gray-900 font-medium">
                      {subscription.current_period_start_date
                        ? new Date(subscription.current_period_start_date).toLocaleDateString()
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Period End</p>
                    <p className="text-gray-900 font-medium">
                      {subscription.current_period_end_date
                        ? new Date(subscription.current_period_end_date).toLocaleDateString()
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Billing Cycle</p>
                    <p className="text-gray-900 font-medium">
                      {subscription.billing_cycle || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={handleManageSubscription}
                disabled={isGeneratingPortal || isCanceling}
                className={`w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
                  (isGeneratingPortal || isCanceling) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingPortal ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Manage Subscription'
                )}
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isGeneratingPortal || isCanceling}
                className={`w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center ${
                  (isGeneratingPortal || isCanceling) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCanceling ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Canceling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg font-medium">
            No active subscription found.
          </p>
        )}
      </div>
    </div>
  );
}