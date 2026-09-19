import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['@afterclass/db'],
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
  async redirects() {
    return [
      { source: '/TestRun', destination: '/enlistment', permanent: true },
      { source: '/testrun', destination: '/enlistment', permanent: true },
      { source: '/test-run', destination: '/enlistment', permanent: true },
    ]
  },
}

export default nextConfig
