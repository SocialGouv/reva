import { setLink } from "@codegouvfr/react-dsfr/link";
import SkipLinks from "@codegouvfr/react-dsfr/SkipLinks";
import { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import { AuthGuard } from "@/components/auth/authGuard";
import { KeycloakProvider } from "@/components/auth/keycloakContext";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";
import { Footer } from "@/components/footer/Footer";

const lang = "fr";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace commanditaire France VAE",
};

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
          <KeycloakProvider>
            <AuthGuard>
              <div className="w-full min-h-screen flex flex-col">
                <SkipLinks
                  links={[
                    {
                      anchor: "#content",
                      label: "Contenu",
                    },
                    {
                      anchor: "#footer",
                      label: "Pied de page",
                    },
                  ]}
                />
                {children}
                <Footer />
              </div>
            </AuthGuard>
          </KeycloakProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}
