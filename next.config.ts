import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/homepage/index.html",
      },
    ];
  },
};

export default nextConfig;
