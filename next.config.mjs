/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure native addons like better-sqlite3 are externalized from webpack bundling
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },

  // Strip X-Powered-By header to prevent server fingerprinting
  poweredByHeader: false,

  // Disallow SVG execution in Image Optimization API to mitigate SVG XSS/RCE vectors
  images: {
    dangerouslyAllowSVG: false,
  },

  // Comprehensive HTTP Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
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
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' data: blob:",
              "connect-src 'self' https://wa.me",
              "frame-ancestors 'none'",
              "form-action 'self' https://wa.me",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
