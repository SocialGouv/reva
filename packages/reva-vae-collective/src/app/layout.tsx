import type { Metadata } from "next";
import "./globals.css";
import { DsfrHead } from "@/components/dsfr/DsfrHead";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace commanditaire France VAE",
};

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
        <DsfrProvider lang={lang}>{children}</DsfrProvider>
      </body>
    </html>
  );
}
