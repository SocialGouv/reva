import dotenv from 'dotenv';
import { CapacitorConfig } from '@capacitor/cli';

dotenv.config();

const config: CapacitorConfig = {
  appId: 'fr.gouv.beta.reva',
  appName: 'reva-app',
  webDir: 'build',
  bundledWebRuntime: !!process.env.CAPACITOR_WEB_RUNTIME
};

if (!!process.env.CAPACITOR_LIVE_RELOAD) {
  config.server = {
    url: `http://${process.env.HOST_IP}:${process.env.PORT}`,
    cleartext: true
  };
}

export default config;
