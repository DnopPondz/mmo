/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: false
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'hooks']
  }
};

export default nextConfig;
