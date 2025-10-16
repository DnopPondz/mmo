/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: false,
    serverComponentsExternalPackages: ['mongodb']
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'hooks']
  }
};

export default nextConfig;
