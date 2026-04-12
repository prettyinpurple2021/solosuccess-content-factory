/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable TypeScript error checking for production builds
  // Remove ignoreBuildErrors to catch issues before deployment
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Enable automatic image optimization with modern formats
    unoptimized: false,
    // Prefer AVIF for best compression, fallback to WebP
    formats: ["image/avif", "image/webp"],
    // Responsive image sizes for different devices
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Smaller sizes for thumbnails and icons
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external image domains if needed (add as needed)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // API routes should have stricter headers
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ]
  },
}

export default nextConfig
