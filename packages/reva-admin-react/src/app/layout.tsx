"use client";

// The three following files must be imported in this specific order:
// Step 1-  Reset the styles for browser consistency

// Step 2 - Add defaults to html tags (eg. a DSFR h1 has a 40px font size by default)

// Step 3 - Add utilities and other classes that, coming last, can override DSFR styles
import "./globals.css";
//import "@codegouvfr/react-dsfr/dsfr/utility/icons/icons.min.css";

import { useEffect } from "react";
import { StartDsfr } from "@/components/dsfr/StartDsfr";
import { DsfrHead } from "@/components/dsfr/DsfrHead";
import { defaultColorScheme } from "@/components/dsfr/defaultColorScheme";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Keycloak from "keycloak-js";

import {
  KeycloakProvider,
  useKeycloakContext,
} from "@/components/auth/keycloakContext";
import {
  HELP_BUBBLE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM,
  KEYCLOAK_URL,
  PRODUKTLY_CLIENT_TOKEN,
} from "@/config/config";
import { useCrisp } from "@/components/crisp/useCrisp";
import { fr } from "date-fns/locale";
import { setDefaultOptions } from "date-fns";
import Script from "next/script";
import { Produktly } from "@/components/produktly/Produktly";

const keycloakInstance =
  typeof window !== "undefined"
    ? Keycloak({
        clientId: KEYCLOAK_CLIENT_ID || "",
        realm: KEYCLOAK_REALM || "",
        url: KEYCLOAK_URL,
      })
    : undefined;

const queryClient = new QueryClient();

setDefaultOptions({ locale: fr });

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html {...getHtmlAttributes({ defaultColorScheme })}>
      <head>
        <StartDsfr />
        <DsfrHead />
        {HELP_BUBBLE_URL && <Script src={HELP_BUBBLE_URL} />}
        {PRODUKTLY_CLIENT_TOKEN && <Produktly />}
      </head>
      <body>
        <DsfrProvider>
          <KeycloakProvider keycloakInstance={keycloakInstance}>
            <QueryClientProvider client={queryClient}>
              <Toaster position="top-right" />
              <LayoutContent>{children}</LayoutContent>
            </QueryClientProvider>
          </KeycloakProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}

const LayoutContent = ({ children }: { children: JSX.Element }) => {
  const { authenticated, keycloakUser } = useKeycloakContext();

  const { configureUser, resetUser } = useCrisp();

  useEffect(() => {
    if (keycloakUser) {
      const { id, email } = keycloakUser;

      configureUser({
        id,
        email,
      });
    } else {
      resetUser();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloakUser]);

  return (
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
      <Header />
      <main
        role="main"
        id="content"
        className="flex flex-col flex-1 md:bg-gradient-to-r from-[#557AFF] to-[#2400FF] "
      >
        <div className="fr-container flex flex-col flex-1">
          <div
            className={`fr-container flex-1 md:mt-16 px-1 pt-4 md:px-8 md:pt-8 md:pb-8 fr-grid-row bg-white mb-12`}
          >
            {authenticated && children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
