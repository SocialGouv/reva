"use client";
import { useEffect } from "react";
import { StartDsfr } from "@/components/dsfr/StartDsfr";
import { defaultColorScheme } from "@/components/dsfr/defaultColorScheme";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import Keycloak from "keycloak-js";
import "./globals.css";
import {
  KeycloakProvider,
  useKeycloakContext,
} from "@/components/auth/keycloakContext";
import {
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM,
  KEYCLOAK_URL,
} from "@/config/config";
import { useCrisp } from "@/components/crisp/useCrisp";

const keycloakInstance =
  typeof window !== "undefined"
    ? Keycloak({
        clientId: KEYCLOAK_CLIENT_ID || "",
        realm: KEYCLOAK_REALM || "",
        url: KEYCLOAK_URL,
      })
    : undefined;

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html {...getHtmlAttributes({ defaultColorScheme })}>
      <head>
        <StartDsfr />
        <DsfrHead Link={Link} />
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
            className={`fr-container flex-1 md:mt-16 px-8 pt-8 pb-8 fr-grid-row bg-white mb-12`}
          >
            {authenticated && children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
