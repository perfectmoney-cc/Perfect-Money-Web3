import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6243b800500c49bba6ef73a690a3b7b6',
  appName: 'Perfect Money',
  webDir: 'dist',
  server: {
    url: 'https://6243b800-500c-49bb-a6ef-73a690a3b7b6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
    },
  },
};

export default config;
