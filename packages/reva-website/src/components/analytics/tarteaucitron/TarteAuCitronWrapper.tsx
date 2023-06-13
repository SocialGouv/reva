import { CRISP, MATOMO } from "@/config/config";
import Script from "next/script";
import { useEffect } from "react";

const tarteAuCitronFolder = "/vendor/tarteaucitronjs";
export const TarteAuCitronWrapper = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      (
        window as unknown as { tarteaucitronForceCDN: string }
      ).tarteaucitronForceCDN = `${tarteAuCitronFolder}/`;
    }
  }, []);

  return (
    <>
      <Script
        src={`${tarteAuCitronFolder}/tarteaucitron.js`}
        onLoad={() => {
          if (typeof window !== "undefined") {
            (window as any).tarteaucitron.init({
              useExternalCss: true,
              removeCredit: true,
              iconPosition: "BottomLeft",
            });
            matomoServiceInit();
            crispServiceInit();
          }
        }}
      />
    </>
  );
};

export const matomoServiceInit = () => {
  const tarteaucitron = (window as any).tarteaucitron;
  tarteaucitron.user.matomotmUrl = `${MATOMO.URL}/js/container_${MATOMO.CONTAINER_NAME}.js`;
  (tarteaucitron.job = tarteaucitron.job || []).push("matomotm");
};

export const crispServiceInit = () => {
  const tarteaucitron = (window as any).tarteaucitron;
  tarteaucitron.user.crispID = CRISP.WEBSITE_ID;
  (tarteaucitron.job = tarteaucitron.job || []).push("crisp");
};
