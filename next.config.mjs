/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configuration for Tauri desktop + mobile
  eslint: {
    ignoreDuringBuilds: false, // Let's actually see the lints!
    dirs: ['app', 'components', 'lib', 'modules'], // Lint these directories
  },
  typescript: {
    ignoreBuildErrors: false, // Let's see TypeScript errors too!
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for Tauri
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  // Handle ES modules properly
  transpilePackages: ['canvas-confetti'],

  // Unified webpack configuration
  webpack: (config, { isServer }) => {
    // Browser-only configurations
    if (!isServer) {
      // Node.js fallbacks for browser
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

      // Ignore problematic modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp': false,
        '@img/sharp-libvips-dev/include': false,
        '@img/sharp-libvips-dev/cplusplus': false,
        '@img/sharp-wasm32/versions': false,
      }

      // Fix transformers.js Sharp imports
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

      // Exclude problematic externals
      config.externals = config.externals || [];
      config.externals.push({
        'react-native-sqlite-storage': 'react-native-sqlite-storage',
        'better-sqlite3': 'better-sqlite3',
        'sharp': 'sharp',
        'onnxruntime-node': 'onnxruntime-node',
      });
    }

    // Handle ES module extensions
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.js'],
    }

    return config
  },
}

export default nextConfig
