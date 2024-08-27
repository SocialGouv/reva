"use client";

import "@/styles/globals.css";
import "@/styles/dsfr-theme-tac.min.css";
import "@/styles/dsfr-theme-tac-extra.css";

import { DsfrHead } from "@/components/dsfr/DsfrHead";
import { StartDsfr } from "@/components/dsfr/StartDsfr";
import { defaultColorScheme } from "@/components/dsfr/defaultColorScheme";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Keycloak from "keycloak-js";
import { Toaster } from "react-hot-toast";

import { useAuth } from "@/components/auth/auth";
import {
  KeycloakProvider,
  useKeycloakContext,
} from "@/components/auth/keycloakContext";
import { Produktly } from "@/components/script/Produktly";
import { tarteaucitronScript } from "@/components/script/Tarteaucitron";

import { AapCgu } from "@/components/aap-cgu";
import {
  AAPNotVisibleInSearchResultNotice,
  useAAPVisibilityCheck,
} from "@/components/aap-not-visible-in-search-result-notice/AAPNotVisibleInSearchResultNotice";
import {
  HELP_BUBBLE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM,
  KEYCLOAK_URL,
  MATOMO_CONTAINER_NAME,
  MATOMO_URL,
  PRODUKTLY_CLIENT_TOKEN,
} from "@/config/config";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import { usePathname } from "next/navigation";
import Script from "next/script";

const keycloakInstance =
  typeof window !== "undefined"
    ? new Keycloak({
        clientId: KEYCLOAK_CLIENT_ID || "",
        realm: KEYCLOAK_REALM || "",
        url: KEYCLOAK_URL,
      })
    : undefined;

const queryClient = new QueryClient();

setDefaultOptions({ locale: fr });

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html {...getHtmlAttributes({ defaultColorScheme })} lang="fr">
      <head>
        <StartDsfr />
        <DsfrHead />
        {HELP_BUBBLE_URL && <Script src={HELP_BUBBLE_URL} />}
        {PRODUKTLY_CLIENT_TOKEN && <Produktly />}
        <title>France VAE</title>
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
        {
          // The tarteaucitron lib waits for the document load event to initialize itself
          // (cf "window.addEventListener("load", function ()" in the tarteaucitron.js file)
          // To avoid cases where tarteaucitron doesn't start because the document is already loaded,
          // we need to use Script in _document.tsx with the beforeInteractive strategy.
          // onLoad can't be used with the beforeInteractive strategy, so we manually
          // create a script tag in order to attach the required onLoad callback
          MATOMO_URL && MATOMO_CONTAINER_NAME && (
            <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
              {tarteaucitronScript({
                matomoUrl: `${MATOMO_URL}/js/container_${MATOMO_CONTAINER_NAME}.js`,
              })}
            </Script>
          )
        }
      </body>
    </html>
  );
}

const CustomNotice = ({ title }: { title: string }) => {
  return (
    <Notice
      isClosable
      onClose={function noRefCheck() {}}
      title={title}
      className="-mb-10"
    />
  );
};

const NoticeComponentMap = (pathname: string) => {
  if (pathname === "/agencies-settings/") {
    return CustomNotice({
      title:
        "Bon à savoir : paramétrer votre compte vous permet d'apparaître dans les recherches des candidats.",
    });
  }
  return null;
};

const LayoutContent = ({ children }: { children: JSX.Element }) => {
  const { authenticated } = useKeycloakContext();

  const {
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority,
  } = useAuth();

  const { isVisibleInSearchResults } = useAAPVisibilityCheck();
  const pathname = usePathname();
  const NoticeComponent = NoticeComponentMap(pathname);

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
      {authenticated && isGestionnaireMaisonMereAAP && <AapCgu />}
      {authenticated &&
        !isAdmin &&
        !isGestionnaireMaisonMereAAP &&
        isOrganism &&
        !isVisibleInSearchResults && <AAPNotVisibleInSearchResultNotice />}

      <main
        role="main"
        id="content"
        className={`flex flex-col flex-1 ${bgClass()}`}
      >
        {NoticeComponent}
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
