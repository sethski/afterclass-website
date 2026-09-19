import type { NextConfig } from 'next'
import path from 'path'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(path.join(__dirname, '../..'))

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ['@afterclass/db'],
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
}

export default nextConfig
