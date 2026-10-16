/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/deepstation/availability': [
      './node_modules/@sparticuz/chromium/bin/**/*',
      './node_modules/playwright-core/**/*',
    ],
    '/api/paradive/availability': [
      './node_modules/@sparticuz/chromium/bin/**/*',
      './node_modules/playwright-core/**/*',
    ],
  },
};

module.exports = nextConfig;
