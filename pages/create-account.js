import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { account, ID } from '@/lib/appwriteConfig';
import Link from 'next/link';
import Head from 'next/head';

const CreateAccount = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/account');
    }
  }, [user, loading, router]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setErrors({ name: '', email: '', password: '' });
    setIsCreating(true);

    let hasError = false;
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Name is required' }));
      hasError = true;
    } else if (name.trim().length < 2) {
      setErrors((prev) => ({ ...prev, name: 'Name must be at least 2 characters' }));
      hasError = true;
    }
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
      setIsCreating(false);
      return;
    }

    try {
      await account.create(ID.unique(), email, password, name.trim());
      await account.createEmailPasswordSession(email, password);
      try {
        await account.createVerification('http://localhost:3000/verify-email');
      } catch (verificationError) {
        console.error('Error sending verification email:', {
          message: verificationError.message,
          code: verificationError.code,
          type: verificationError.type,
          stack: verificationError.stack,
        });
        toast.error('Failed to send verification email. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
        });
        setIsCreating(false);
        return;
      }
      sessionStorage.setItem('verificationEmail', email);
      toast.success('Account created successfully! Please check your email to verify.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
      window.location.reload();
    } catch (error) {
      console.error('Error during account creation:', {
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack,
      });
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 409) {
        errorMessage = 'An account with this email already exists. Please log in or use a different email.';
      } else if (error.code === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 400) {
        errorMessage = 'Invalid input data. Please check your entries.';
      } else if (error.code === 401) {
        errorMessage = 'Authentication failed. Please try again.';
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
      setIsCreating(false);
    }
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
        <title>Create Account | Your App Name</title>
        <meta name="description" content="Create a new account" />
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Get started with your new account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
 
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
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Google signup is not available. Please use Email & Password.
                </p>
              </div>
            )}

            {activeTab === 'email' && (
              <form onSubmit={handleCreateAccount} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`block w-full pr-10 sm:text-sm rounded-md py-3 ${
                          errors.name
                            ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-400 focus:outline-none focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        placeholder="John Doe"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>
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
                        autoComplete="new-password"
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

                <div>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 ${
                      isCreating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : 'Create account'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAccount;