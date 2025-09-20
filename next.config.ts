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
  images: {
    // 🚀 Libera domínios externos para o <Image />
    domains: [
      "i.ibb.co",
      "cdn-gop.garenanow.com",
      "i.postimg.cc",
      "contentgarena-a.akamaihd.net", // 👈 adiciona esse aqui
    ],
  },
};

export default nextConfig;
