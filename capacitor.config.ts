import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e5ca16942ba34104b083416e6edd6811',
  appName: 'ChitFund Manager',
  webDir: 'dist',
  server: {
    url: 'https://e5ca1694-2ba3-4104-b083-416e6edd6811.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;