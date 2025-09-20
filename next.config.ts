import type {NextConfig} from 'next';
import { devIndicatorServerState } from 'next/dist/server/dev/dev-indicator-server-state';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};
export default nextConfig;
