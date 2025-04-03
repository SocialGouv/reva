"use client";
import "@/styles/globals.css";
import "@/styles/dsfr-theme-tac.min.css";
import "@/styles/dsfr-theme-tac-extra.css";
import "@/styles/ckeditor5-content-styles.css";
import { DsfrProvider } from "../dsfr-bootstrap";
import { StartDsfrOnHydration } from "../dsfr-bootstrap";
import { tarteaucitronScript } from "@/components/script/TarteaucitronScript";
import Script from "next/script";
import { DsfrHead } from "./_components/dsfr/DsfrHead";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function RootLayout({ children }: { children: JSX.Element }) {
  const matomoBaseUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoContainerName = process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME;
  const lang = "fr";
  const queryClient = new QueryClient();

  return (
    //should use  <html {...getHtmlAttributes({ lang })} ... but calling getHtmlAttributes clashes with tailwind css overrides for unknown reasons
    <html
      lang="fr"
      data-fr-scheme="light"
      data-fr-theme="light"
      data-fr-js="true"
    >
      <head>
        <StartDsfrOnHydration />
        <DsfrHead />
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </DsfrProvider>
        {matomoBaseUrl && matomoContainerName && (
          <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
            {tarteaucitronScript({
              matomoUrl: `${matomoBaseUrl}/js/container_${matomoContainerName}.js`,
            })}
          </Script>
        )}
      </body>
    </html>
  );
}
