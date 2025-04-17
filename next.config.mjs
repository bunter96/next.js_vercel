/** @type {import('next').NextConfig} */
const nextConfig = {
	  images: {
    domains: [
      'lh3.googleusercontent.com', // Allow Google profile picture URLs
    ],
  },
	
  reactStrictMode: true,
};

export default nextConfig;
