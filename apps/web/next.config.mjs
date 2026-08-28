/** @type {import('next').NextConfig} */
const backendUrl = process.env.BE_URL || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
