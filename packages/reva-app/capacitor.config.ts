import { CapacitorConfig } from "@capacitor/cli";
import dotenv from "dotenv";

dotenv.config();

const config: CapacitorConfig = {
  appId: "fr.gouv.beta.reva",
  appName: "reva-app",
  webDir: "build",
  bundledWebRuntime: !!process.env.CAPACITOR_WEB_RUNTIME,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#fff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

if (!!process.env.CAPACITOR_LIVE_RELOAD) {
  config.server = {
    url: `http://${process.env.HOST_IP}:${process.env.PORT}`,
    cleartext: true,
  };
}

export default config;
