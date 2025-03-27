/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['geist'],
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig; 