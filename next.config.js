/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/deepstation/availability': ['./node_modules/@sparticuz/chromium/bin/**/*'],
  },
};

module.exports = nextConfig;
