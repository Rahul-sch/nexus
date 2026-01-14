import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'sha256-...'", // In production, use specific SHA hashes for inline scripts
      isDev
        ? "style-src 'self' 'unsafe-inline'"
        : "style-src 'self' 'unsafe-inline'", // Keep unsafe-inline for Tailwind/CSS-in-JS (consider nonce in future)
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co" + (isDev ? " ws://localhost:* http://localhost:*" : ""),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'", // Prevent Flash/Java/ActiveX
      "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
    ].join('; ')
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' }, // Prevent Adobe Flash/PDF cross-domain requests
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }, // Isolate origin
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }, // Prevent window.opener access
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }, // Prevent resource loading from other origins
  // HSTS: Enforce HTTPS for 2 years, include subdomains, allow preload
  // Note: Only apply in production with valid HTTPS certificate
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }])
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Transpile workspace packages
  transpilePackages: ['@nexus/shared', '@nexus/orchestration'],
  // Force Node.js runtime for API routes (not Edge)
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb'
    },
    // Use webpack for production builds (more stable with monorepos)
    turbo: {
      root: '..'
    }
  }
};

export default nextConfig;
