"use client";

import "@/styles/globals.css";
import "@/styles/dsfr-theme-tac.min.css";
import "@/styles/dsfr-theme-tac-extra.css";

// import { getHtmlAttributes } from "@/components/dsfr/server-only-index";

import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { HTMLAttributes } from "react";
import { Toaster } from "react-hot-toast";

import { AuthGuard } from "@/components/auth/auth.guard";
import { KeycloakProvider } from "@/components/auth/keycloak.context";
import { CandidacyGuard } from "@/components/candidacy/candidacy.context";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";
import { DsfrHead } from "@/components/dsfr/DsfrHead";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { tarteaucitronScript } from "@/components/script/TarteaucitronScript";

import { LayoutNotice } from "./_components/layout-notice/LayoutNotice";
import { WhiteBoxContainer } from "./_components/WhiteBoxContainer";

const queryClient = new QueryClient();

setDefaultOptions({ locale: fr });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const matomoBaseUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoContainerName = process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME;

  const lang = "fr";

  return (
    <html
      //should use  <html {...getHtmlAttributes({ lang })} ... but calling getHtmlAttributes clashes with tailwind css overrides for unknown reasons
      // {...getHtmlAttributes({ lang })}
      lang={lang}
    >
      <head>
        <StartDsfrOnHydration />
        <DsfrHead />

        <title>France VAE</title>
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <KeycloakProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster position="top-right" />
              <LayoutContent>
                <AuthGuard>
                  {({ authenticated }) =>
                    authenticated ? (
                      <CandidacyGuard>{children}</CandidacyGuard>
                    ) : (
                      children
                    )
                  }
                </AuthGuard>
              </LayoutContent>
            </QueryClientProvider>
          </KeycloakProvider>
        </DsfrProvider>
        {
          // The tarteaucitron lib waits for the document load event to initialize itself
          // (cf "window.addEventListener("load", function ()" in the tarteaucitron.js file)
          // To avoid cases where tarteaucitron doesn't start because the document is already loaded,
          // we need to use Script in _document.tsx with the beforeInteractive strategy.
          // onLoad can't be used with the beforeInteractive strategy, so we manually
          // create a script tag in order to attach the required onLoad callback
          matomoBaseUrl && matomoContainerName && (
            <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
              {tarteaucitronScript({
                matomoUrl: `${matomoBaseUrl}/js/container_${matomoContainerName}.js`,
              })}
            </Script>
          )
        }
      </body>
    </html>
  );
}

const UNAUTHENTICATED_PATHS = [
  "/login-confirmation",
  "/login",
  "/logout-confirmation",
  "/forgot-password",
  "/reset-password",
];

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isRootPath = pathname === "/";
  const isUnAuthenticatedPath =
    UNAUTHENTICATED_PATHS.findIndex((path) => pathname.startsWith(path)) != -1;

  let className: HTMLAttributes<HTMLDivElement>["className"] =
    "fr-container flex flex-col flex-1";

  if (isUnAuthenticatedPath) {
    className = `${className} max-w-2xl`;
  }

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
        className="flex flex-col flex-1 lg:bg-candidate"
      >
        <div className={className}>
          <LayoutNotice />

          {isRootPath ? (
            <div
              className={`flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 fr-grid-row mb-12`}
            >
              {children}
            </div>
          ) : (
            <WhiteBoxContainer>{children}</WhiteBoxContainer>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
