import "./globals.css";
import { setLink } from "@codegouvfr/react-dsfr/link";
import Link from "next/link";

import { KeycloakProvider } from "@/components/auth/keycloakContext";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";

const lang = "fr";

//force use of next/link for dsfr
//otherwise sometimes it uses the wrong link when a page is first rendered
setLink({ Link });

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
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <KeycloakProvider>{children}</KeycloakProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}
