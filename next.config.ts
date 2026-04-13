import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@ast-grep/napi": "./src/stubs/ast-grep-napi.js",
    },
  },
};

export default nextConfig;
