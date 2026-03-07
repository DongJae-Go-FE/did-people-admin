import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["exceljs", "canvas"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
