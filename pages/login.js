import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { account } from '@/lib/appwriteConfig';
import Link from 'next/link';
import Head from 'next/head';

const Login = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { verify } = router.query;
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // --- New State for Forgot Password Modal ---
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);


  // Show verification prompt if verify=true
  useEffect(() => {
    if (verify === 'true') {
      toast.info('Please log in to complete email verification.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  }, [verify]);

  // Redirect to /account if authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/account');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      // Clear existing sessions
      try {
        const sessions = await account.listSessions();
        await Promise.all(
          sessions.sessions.map((session) => account.deleteSession(session.$id))
        );
      } catch (error) {
        console.warn('No sessions to clear:', error);
      }
      // Redirect to the server-side route that initiates Google OAuth
      window.location.href = '/api/auth/login';
    } catch (error) {
      console.error('Error initiating Google login:', error);
      setIsSigningIn(false);
      toast.error('Failed to start Google login. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });
    setIsSigningIn(true);

    // Client-side validation
    let hasError = false;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      hasError = true;
    } else if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
      hasError = true;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      hasError = true;
    } else if (password.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
      hasError = true;
    }

    if (hasError) {
      setIsSigningIn(false);
      return;
    }

    try {
      // Clear existing sessions
      try {
        const sessions = await account.listSessions();
        await Promise.all(
          sessions.sessions.map((session) => account.deleteSession(session.$id))
        );
      } catch (error) {
        console.warn('No sessions to clear:', error);
      }

      // Create email/password session
      await account.createEmailPasswordSession(email, password);
      toast.success('Successfully signed in!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
      window.location.reload();
    } catch (error) {
      console.error('Error during email login:', {
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack,
      });
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 400 && error.message.includes('session is active')) {
        errorMessage = 'An active session was detected. Please log out and try again.';
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
      setIsSigningIn(false);
    }
  };

  // --- New Function to Handle Forgot Password ---
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    if (!validateEmail(forgotPasswordEmail)) {
        setForgotPasswordError('Please enter a valid email address.');
        return;
    }
    setIsSendingRecovery(true);
    try {
        const resetUrl = `${window.location.origin}/reset-password`;
        await account.createRecovery(forgotPasswordEmail, resetUrl);
        setRecoverySent(true);
    } catch (error) {
        console.error('Forgot password error:', error);
        setForgotPasswordError('Failed to send recovery email. Please check the email and try again.');
        toast.error('Failed to send recovery email. Please try again.', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
        });
    } finally {
        setIsSendingRecovery(false);
    }
  };

  const openForgotPasswordModal = () => {
    setForgotPasswordEmail(email); // Pre-fill email from login form
    setForgotPasswordError('');
    setRecoverySent(false);
    setIsForgotPasswordModalOpen(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Sign In | Your App Name</title>
        <meta name="description" content="Sign in to your account" />
      </Head>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Sign in to access your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('google')}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'google'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
              >
                Continue with Google
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
              >
                Email & Password
              </button>
            </div>

            {activeTab === 'google' && (
              <div className="mt-8">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className={`w-full flex justify-center items-center px-4 py-3 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 ${
                    isSigningIn ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.61 7.56 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.56 1 4.01 3.39 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                </button>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        New to our platform?
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/create-account"
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                      Create an account
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <form onSubmit={handleEmailSignIn} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full pr-10 sm:text-sm rounded-md py-3 ${
                          errors.email
                            ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-400 focus:outline-none focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="email-error">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`block w-full pr-10 sm:text-sm rounded-md py-3 ${
                          errors.password
                            ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-400 focus:outline-none focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        placeholder="••••••••"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="password-error">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={openForgotPasswordModal}
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 ${
                      isSigningIn ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSigningIn ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : 'Sign in'}
                  </button>
                </div>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        New to our platform?
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/create-account"
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                      Create an account
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

       {/* Forgot Password Modal */}
       {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md m-4">
            {!recoverySent ? (
              <form onSubmit={handleForgotPasswordSubmit}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Reset your password</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Enter your email address and we will send you a link to reset your password.
                </p>
                <div className="mt-4">
                  <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email address
                  </label>
                  <input
                    id="forgot-password-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className={`mt-1 block w-full sm:text-sm rounded-md py-3 px-4 ${
                        forgotPasswordError
                        ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-400 focus:outline-none focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="you@example.com"
                    required
                  />
                   {forgotPasswordError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {forgotPasswordError}
                      </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRecovery}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSendingRecovery ? 'Sending...' : 'Send reset link'}
                  </button>
                </div>
              </form>
            ) : (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Check your inbox</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>. Please check your email and follow the instructions.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsForgotPasswordModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
