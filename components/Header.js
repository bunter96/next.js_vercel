"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Box,
  AudioWaveform,
  Copy,
  DollarSign,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { account } from '@/lib/appwriteConfig';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const mobileMenuRef = useRef(null);
  const accountMenuRef = useRef(null);
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menus when clicking outside or on route change
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleAccountMenu = () => setAccountMenuOpen((prev) => !prev);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [router.pathname]);

  const menuItems = [
    { href: '/', label: 'Home', icon: <Home className="w-5 h-5 mr-2" /> },
    { href: '/browse-models', label: 'Browse Models', icon: <Box className="w-5 h-5 mr-2" /> },
    { href: '/tts', label: 'Text To Speech', icon: <AudioWaveform className="w-5 h-5 mr-2" /> },
    { href: '/voice-cloning', label: 'Voice Cloning', icon: <Copy className="w-5 h-5 mr-2" /> },
    { href: '/pricing', label: 'Pricing', icon: <DollarSign className="w-5 h-5 mr-2" /> },
  ];

  const accountMenuItems = [
    { href: '/account', label: 'My Account', icon: <User className="w-4 h-4 mr-2" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4 mr-2" /> },
    { href: '/billing', label: 'Billing', icon: <CreditCard className="w-4 h-4 mr-2" /> },
    { href: '/help', label: 'Help Center', icon: <HelpCircle className="w-4 h-4 mr-2" /> },
  ];

  const isActive = (path) => router.pathname === path;

  const handleLogin = () => {
    const currentPath = router.asPath;
    account.createOAuth2Session(
      'google',
      `${window.location.origin}${currentPath}`,
      `${window.location.origin}/login`
    );
  };

  if (!isClient) {
    return (
      <header className="bg-white sticky top-0 z-50 shadow">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="w-40 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow">
      {/* Main Header Bar */}
      <div className="w-full px-7 py-4 flex items-center justify-between">
        {/* Logo - Left Side - Updated to always show text */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" legacyBehavior>
            <a className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-9" />
              <span className="text-xl font-bold text-black align-middle leading-9">Fish Audio</span>
            </a>
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
		<nav className="hidden md:flex flex-1 justify-center space-x-2 mx-4">
		  {menuItems.map(({ href, label, icon }) => (
			<Link href={href} key={href} legacyBehavior>
			  <a
				className={`flex items-center px-4 py-1 rounded-md font-semibold text-base leading-9 text-black ${
				  isActive(href) ? 'bg-gray-100' : 'hover:bg-gray-50'
				}`}
			  >
				{icon}
				<span className="ml-2">{label}</span>
			  </a>
			</Link>
		  ))}
		</nav>

        {/* Right Side - Auth/Account */}
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={toggleAccountMenu}
                className="flex items-center focus:outline-none"
              >
                {user.prefs?.picture ? (
                  <img
                    src={user.prefs.picture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-400 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    {user.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || 'My Account'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email || ''}
                    </p>
                  </div>
                  <div className="py-1">
                    {accountMenuItems.map(({ href, label, icon }) => (
                      <Link href={href} key={href} legacyBehavior>
                        <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          {icon}
                          <span className="ml-2">{label}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={logout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50" // Changed to text-red-600
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="ml-2">Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 focus:outline-none ml-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white shadow-lg mx-2 rounded-b-lg overflow-hidden"
        >
          <nav className="flex flex-col py-2">
            {menuItems.map(({ href, label, icon }) => (
              <Link href={href} key={href} legacyBehavior>
                <a
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    isActive(href) ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{icon}</span>
                  {label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Mobile Account Section */}
          <div className="border-t border-gray-200 py-2">
            {loading ? (
              <div className="px-4 py-3 flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                <div className="px-4 py-3 flex items-center">
                  {user.prefs?.picture ? (
                    <img
                      src={user.prefs.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 mr-3">
                      {user.name?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || 'My Account'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email || ''}
                    </p>
                  </div>
                </div>
                {accountMenuItems.map(({ href, label, icon }) => (
                  <Link href={href} key={href} legacyBehavior>
                    <a className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                      <span className="mr-3">{icon}</span>
                      {label}
                    </a>
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-gray-50 border-t border-gray-100"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 border-t border-gray-100"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}