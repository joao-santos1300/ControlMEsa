import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Gera .next/standalone: servidor mínimo usado pelo executável Electron (web/electron)
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
