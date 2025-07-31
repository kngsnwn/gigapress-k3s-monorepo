/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        destination: '/$1',
      },
    ]
  },
  webpack: (config) => {
    config.externals.push({
      'bufferutil': 'commonjs bufferutil',
      'utf-8-validate': 'commonjs utf-8-validate',
    });
    return config;
  },
}

module.exports = nextConfig
