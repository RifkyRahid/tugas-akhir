declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  import type { PWAConfig } from 'next-pwa';

  export default function withPWA(config: NextConfig & { pwa?: PWAConfig }): NextConfig;
}
