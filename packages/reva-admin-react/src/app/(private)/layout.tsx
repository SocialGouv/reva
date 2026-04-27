"use client";

import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useCrisp } from "@/components/crisp/useCrisp";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { LayoutNotice } from "@/components/layout-notice/LayoutNotice";

const WHITE_CARD_LAYOUT_EXCLUDED_PATHS = ["/candidacies/annuaire"] as const;

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, keycloakUser } = useKeycloakContext();
  const { status: featureFlippingStatus, isFeatureActive } =
    useFeatureflipping();
  const isFeatureFlippingReady = featureFlippingStatus === "INITIALIZED";
  const pathname = usePathname();
  const shouldLoadCrisp =
    authenticated && isFeatureActive("SHOW_CRISP_IN_ADMIN");

  const { configureUser, resetUser } = useCrisp({
    shouldLoad: shouldLoadCrisp,
  });

  const {
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority,
    isCertificationRegistryManager,
  } = useAuth();

  useEffect(() => {
    if (keycloakUser && shouldLoadCrisp) {
      const { id, email } = keycloakUser;
      configureUser({
        id,
        email,
      });
    } else {
      resetUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloakUser, shouldLoadCrisp]);

  const bgClass = () => {
    if (isAdmin) {
      return "lg:bg-admin";
    }
    if (isOrganism || isGestionnaireMaisonMereAAP) {
      return "lg:bg-organism";
    }
    if (
      isCertificationAuthority ||
      isAdminCertificationAuthority ||
      isCertificationRegistryManager
    ) {
      return "lg:bg-certification-authority";
    }
    return "lg:bg-unknown";
  };

  const isWhiteCardLayoutExcludedPath = WHITE_CARD_LAYOUT_EXCLUDED_PATHS.some(
    (path) => pathname.startsWith(path),
  );

  const childrenWhiteCardLayoutClassname = isWhiteCardLayoutExcludedPath
    ? ""
    : "bg-white lg:shadow-lifted pt-4 md:pt-8 mt-0";

  return (
    isFeatureFlippingReady && (
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
        <LayoutNotice />

        <main
          role="main"
          id="content"
          className={`flex flex-col flex-1 ${bgClass()}`}
        >
          <div className="fr-container flex flex-col flex-1">
            <div
              className={`flex-1 px-1 mt-4 md:mt-8 md:px-6 md:pb-8 fr-grid-row mb-12 ${childrenWhiteCardLayoutClassname}`}
            >
              {authenticated && children}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  );
}
