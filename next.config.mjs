/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse and mammoth read test/fixture files during webpack bundling unless excluded
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
