import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id) {
      // Optionally verify the session with an API call (see Step 5)
      console.log('Payment successful, session ID:', session_id);
      router.push('/'); // Redirect to home or dashboard
    }
  }, [session_id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Thank you for subscribing!</h1>
    </div>
  );
}