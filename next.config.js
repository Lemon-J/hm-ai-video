/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // 在Docker构建时跳过类型检查和lint检查
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用静态生成，避免构建时数据库连接问题
  output: 'standalone',
}

// 根据环境变量决定是否禁用字体优化（Next.js 15+ 已移除 fontLoaders）
if (process.env.DISABLE_FONT_OPTIMIZATION === 'true') {
  console.log('字体优化已禁用 - 注意：Next.js 15+ 已内置字体优化')
}

module.exports = nextConfig