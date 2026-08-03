/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TODO Eliminar este pattern innecesario que solo se usará para pruebas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    qualities: [75,90]
  },
};

export default nextConfig;
