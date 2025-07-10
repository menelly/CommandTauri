/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [], // Don't lint any directories during build
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for Electron
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  experimental: {
    swcPlugins: [
      ['@swc/plugin-transform-imports', {}]
    ],
    // Enable ES modules support
    esmExternals: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for transformers.js in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      }

      // Completely ignore Sharp and related modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp': false,
        '@img/sharp-libvips-dev/include': false,
        '@img/sharp-libvips-dev/cplusplus': false,
        '@img/sharp-wasm32/versions': false,
      }

      // Add module rules to ignore Sharp imports
      config.module.rules.push({
        test: /node_modules\/@huggingface\/transformers\/.*\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: /require\(['"]sharp['"]\)/g,
            replace: 'null',
          },
        },
      })
    }
    return config
  },
  // Force Next.js to use Babel instead of SWC for WatermelonDB decorators
  swcMinify: false,
  compiler: {
    // This tells Next.js to use Babel
  },
  // Handle ES modules properly
  transpilePackages: ['canvas-confetti'],
  webpack: (config) => {
    // Handle ES modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.js'],
    }
    return config
  },
}

export default nextConfig
