/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  env: {
    // Use localhost for development, production URL for deployment
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://chitbox.co/api' : 'http://localhost:3005/api'),
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || (process.env.NODE_ENV === 'production' ? 'https://chitbox.co' : 'http://localhost:3005'),
  },
  // Fix Turbopack workspace issues
  turbopack: {
    root: process.cwd()
  }
}

module.exports = nextConfig
