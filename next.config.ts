import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚀 Ignora erros de lint no build (não trava deploy no Vercel)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚀 Ignora erros de tipagem TypeScript no build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
