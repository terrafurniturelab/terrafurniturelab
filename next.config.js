/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    domains: [
      'www.mandiri.co.id',
      'www.bni.co.id',
      'upload.wikimedia.org',
      'lh3.googleusercontent.com',
      'res.cloudinary.com'
    ],
  },
}

module.exports = nextConfig 