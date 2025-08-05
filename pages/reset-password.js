import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { account } from '@/lib/appwriteConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import Link from 'next/link';
import ConfirmationModal from '../components/ConfirmationModal'; // Make sure this path is correct

const ResetPassword = () => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // State for the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Extract userId and secret from the URL query parameters
    const { userId, secret } = router.query;

    useEffect(() => {
        // This effect runs when the component mounts and the router is ready
        if (router.isReady) {
            if (!userId || !secret) {
                setError('Invalid password reset link. Please try requesting a new one.');
                toast.error('Invalid password reset link.', { position: 'top-right' });
            }
        }
    }, [router.isReady, userId, secret]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }

        if (!userId || !secret) {
            setError('Missing required information from reset link.');
            return;
        }

        setIsSubmitting(true);
        try {
            await account.updateRecovery(userId, secret, password, passwordConfirm);
            setSuccess(true);
            toast.success('Your password has been reset successfully!', { position: 'top-right' });
        } catch (err) {
            // Check for the specific invalid/expired token error from Appwrite
            if (err.message && err.message.toLowerCase().includes('invalid token')) {
                // This is an expected error if the token is old or has been used.
                // We will show a user-friendly modal instead of logging an error to the console,
                // which prevents the Next.js error overlay from appearing.
                setIsModalOpen(true);
            } else {
                // For all other unexpected errors, log them and show a generic error message.
                console.error('Password reset failed:', err);
                setError('An unexpected error occurred. Please try again.');
                toast.error('An unexpected error occurred. Please try again.', { position: 'top-right' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler to close the modal and redirect to the login page
    const handleModalCloseAndRedirect = () => {
        setIsModalOpen(false);
        router.push('/login');
    };

    return (
        <>
            <Head>
                <title>Reset Password | Your App Name</title>
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
                        {success ? 'Password Reset!' : 'Set a new password'}
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                        {success ? (
                            <div className="text-center">
                                <p className="text-gray-700 dark:text-gray-200">Your password has been changed successfully.</p>
                                <Link href="/login" className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    
                                        Back to Sign In
                                    
                                </Link>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleResetPassword}>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        New Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Enter your new password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="passwordConfirm"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        Confirm New Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="passwordConfirm"
                                            name="passwordConfirm"
                                            type="password"
                                            value={passwordConfirm}
                                            onChange={(e) => setPasswordConfirm(e.target.value)}
                                            required
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Confirm your new password"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !userId || !secret}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for expired/invalid token */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalCloseAndRedirect}
                onConfirm={handleModalCloseAndRedirect}
                title="Link Expired or Invalid"
                message="This password reset link is no longer valid because it has expired or has already been used. Please request a new one from the login page."
                confirmButtonText="Go to Login"
                cancelButtonText="Close"
            />
        </>
    );
};

export default ResetPassword;
