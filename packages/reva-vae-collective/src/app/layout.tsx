import type { Metadata } from "next";
import "./globals.css";
import {
  getHtmlAttributes,
  DsfrHead,
} from "../dsfr-bootstrap/server-only-index";
import { DsfrProvider, StartDsfrOnHydration } from "../dsfr-bootstrap";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace commanditaire France VAE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html {...getHtmlAttributes({ lang: "fr" })}>
      <head>
        <StartDsfrOnHydration />
        <DsfrHead />
      </head>
      <body>
        <DsfrProvider lang="fr">{children}</DsfrProvider>
      </body>
    </html>
  );
}
