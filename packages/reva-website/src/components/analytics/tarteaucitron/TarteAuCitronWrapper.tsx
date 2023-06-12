/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import { MATOMO } from "@/config/config";
import Script from "next/script";

const tarteAuCitronFolder = "/vendor/tarteaucitronjs";
export const TarteAuCitronWrapper = () => (
  <>
    <Script id="pretarteaucitron" strategy="beforeInteractive">
      {`
        if (typeof window !== "undefined") {
            window.tarteaucitronForceCDN = "${tarteAuCitronFolder}/";
        }
    `}
    </Script>
    <Script
      src={`${tarteAuCitronFolder}/tarteaucitron.js`}
      strategy="beforeInteractive"
    />
    <Script id="tarteaucitronInit">
      {`
        if (typeof window !== "undefined") {
            tarteaucitron.init({});
            ${matomoService}
        }
      `}
    </Script>
  </>
);

export const matomoService = `tarteaucitron.user.matomotmUrl = '${MATOMO.URL}/js/container_${MATOMO.CONTAINER_NAME}.js';
(tarteaucitron.job = tarteaucitron.job || []).push('matomotm');`;
