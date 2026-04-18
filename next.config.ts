import type { NextConfig } from 'next'

const nextConfig: NextConfig = {

  
// Increasing the limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
