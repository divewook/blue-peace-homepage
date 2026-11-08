/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return ['/admin/:path*', '/instructor/:path*', '/TEST/:path*'].map(source => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
    }));
  },
  outputFileTracingIncludes: {
    '/api/deepstation/availability': [
      './node_modules/@sparticuz/chromium/bin/**/*',
      './node_modules/playwright-core/**/*',
    ],
    '/api/paradive/availability': [
      './node_modules/@sparticuz/chromium/bin/**/*',
      './node_modules/playwright-core/**/*',
    ],
    '/api/marina/availability': [
      './node_modules/@sparticuz/chromium/bin/**/*',
      './node_modules/playwright-core/**/*',
    ],
  },
};

module.exports = nextConfig;
