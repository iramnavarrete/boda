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
  },
};

export default nextConfig;
