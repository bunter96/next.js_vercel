import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { account } from '@/lib/appwriteConfig';
import Head from 'next/head';

const VerifyEmail = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userId, secret } = router.query; // Extract query parameters
  const [isVerifying, setIsVerifying] = useState(!!userId && !!secret); // Auto-verify if params exist
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  // Fetch email and check authentication
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (!loading) {
      if (!user) {
        // No session, redirect to login with verify flag
        router.push('/login?verify=true');
      } else if (user.emailVerification) {
        // Already verified, redirect to account
        sessionStorage.removeItem('verificationEmail');
        router.push('/account');
      }
    }
  }, [user, loading, router]);

  // Handle automatic verification if userId and secret are in URL
  useEffect(() => {
    if (userId && secret && user) {
      const verifyEmail = async () => {
        try {
          await account.updateVerification(userId, secret);
          toast.success('Email verified successfully!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
          });
          sessionStorage.removeItem('verificationEmail');
          await router.push('/account');
        } catch (error) {
          console.error('Error during email verification:', {
            message: error.message,
            code: error.code,
            type: error.type,
            stack: error.stack,
          });
          let errorMessage = 'Failed to verify email. Please try again.';
          if (error.code === 400) {
            errorMessage = 'Invalid or expired verification link. Please request a new one.';
          } else if (error.code === 401) {
            errorMessage = 'Session expired. Please log in to verify.';
            router.push('/login?verify=true');
          } else if (error.code === 429) {
            errorMessage = 'Too many attempts. Please try again later.';
          }
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
          });
          setIsVerifying(false);
        }
      };
      verifyEmail();
    }
  }, [userId, secret, user, router]);

  const handleResendLink = async () => {
    setIsResending(true);
    try {
      await account.createVerification('http://localhost:3000/verify-email');
      toast.success('Verification link resent successfully! Check your email.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error('Error resending verification link:', {
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack,
      });
      let errorMessage = 'Failed to resend verification link. Please try again.';
      if (error.code === 429) {
        errorMessage = 'Too many attempts. Please wait before resending.';
      } else if (error.code === 401) {
        errorMessage = 'Session expired. Please log in to verify.';
        router.push('/login?verify=true');
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !email) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Verify Email | Your App Name</title>
        <meta name="description" content="Verify your email address" />
      </Head>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification link to <span className="font-medium">{email}</span>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please click the link in the email to verify your account.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn’t receive the email?{' '}
                <button
                  onClick={handleResendLink}
                  disabled={isResending}
                  className={`font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none ${
                    isResending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isResending ? 'Resending...' : 'Resend link'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;