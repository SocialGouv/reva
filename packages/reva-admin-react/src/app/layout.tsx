"use client";

import "./globals.css";
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
import { useAuth } from "@/components/auth/auth";

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

  const {
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority,
  } = useAuth();

  const bgClass = () => {
    if (isAdmin) {
      return "lg:bg-admin";
    }
    if (isOrganism || isGestionnaireMaisonMereAAP) {
      return "lg:bg-organism";
    }
    if (isCertificationAuthority || isAdminCertificationAuthority) {
      return "lg:bg-certification-authority";
    }
    return "lg:bg-unknown";
  };

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
        className={`flex flex-col flex-1 ${bgClass()}`}
      >
        <div className="fr-container flex flex-col flex-1">
          <div
            className={`fr-container lg:shadow-lifted flex-1 md:mt-8 px-1 pt-4 md:px-8 md:pt-8 md:pb-8 fr-grid-row bg-white mb-12`}
          >
            {authenticated && children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
