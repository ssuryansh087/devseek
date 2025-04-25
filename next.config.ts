/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... any other configurations you might have (reactStrictMode, etc.)

  images: {
    remotePatterns: [
      {
        protocol: "https", // Usually 'https'
        hostname: "res.cloudinary.com", // The hostname from the error
        // port: '', // Optional: Usually not needed unless using a non-standard port
        // pathname: '/your-cloud-name/image/upload/**', // Optional: For more specific paths if needed
      },
      // ... you can add other patterns here if you use other image sources
    ],
  },
};

module.exports = nextConfig;
