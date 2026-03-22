import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "bullmq", "ioredis", "archiver"],
};

export default nextConfig;
