"use client";

import "./globals.css";
import { KeycloakProvider } from "@/components/auth/keycloakContext";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";
import { DsfrHead } from "@/components/dsfr/DsfrHead";

const lang = "fr";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //should use  <html {...getHtmlAttributes({ lang })} ... but calling getHtmlAttributes clashes with tailwind css overrides for unknown reasons
    <html
      lang={lang}
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
          <KeycloakProvider>{children}</KeycloakProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}
