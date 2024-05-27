"use client";
import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { ADMIN_ELM_URL } from "@/config/config";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";

export const Header = () => {
  const currentPathname = usePathname();
  const {
    isAdmin,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isCertificationAuthority,
    isAdminCertificationAuthority,
  } = useAuth();
  const { authenticated, logout } = useKeycloakContext();

  const candidaciesLabel = isAdmin
    ? "Certificateurs/Candidatures"
    : "Candidatures";
  const navigation = authenticated
    ? [
        ...(isAdmin || isOrganism || isGestionnaireMaisonMereAAP
          ? [
              {
                text: "Candidatures",
                linkProps: {
                  href: "/candidacies",
                },
                isActive: !!currentPathname.match(/\/candidacies\/.*\/logs/),
              },
            ]
          : []),

        ...(!isAdmin && (isOrganism || isGestionnaireMaisonMereAAP)
          ? [
              {
                text: "Paramètres",
                linkProps: {
                  href: "/agencies-settings",
                  target: "_self",
                },
                isActive: currentPathname.startsWith("/agencies-settings"),
              },
            ]
          : []),
        ...(isAdmin
          ? [
              {
                text: "Inscriptions",
                linkProps: {
                  href: "/subscriptions/pending",
                  target: "_self",
                },
                isActive: currentPathname.startsWith("/subscriptions"),
              },
              {
                text: "Comptes",
                linkProps: {
                  href: "/accounts/organisms",
                  target: "_self",
                },
                isActive: currentPathname.startsWith("/accounts"),
              },
              {
                text: "Certifications",
                linkProps: {
                  href: "/certifications",
                  target: "_self",
                },
              },
              {
                text: "Certificateurs",
                linkProps: {
                  href: "/certification-authorities",
                  target: "_self",
                },
                isActive: currentPathname.startsWith(
                  "/certification-authorities",
                ),
              },
            ]
          : []),
        ...(isAdmin || isAdminCertificationAuthority || isCertificationAuthority
          ? [
              {
                text: candidaciesLabel,
                linkProps: {
                  href: "/candidacies/feasibilities",
                  target: "_self",
                },
                isActive: !!(
                  currentPathname.match(
                    /\/candidacies\/(feasibilities)|(dossiers-de-validation)|(juries)/,
                  ) ||
                  currentPathname.match(
                    /\/candidacies\/.*\/(feasibility)|(dossier-de-validation)|(jury)/,
                  )
                ),
              },
            ]
          : []),
        ...(isAdminCertificationAuthority
          ? [
              {
                text: "Gestion des comptes locaux",
                linkProps: {
                  href: "/certification-authorities/local-accounts/",
                  target: "_self",
                },
                isActive: currentPathname.startsWith(
                  "/certification-authorities",
                ),
              },
            ]
          : []),
      ]
    : [
        {
          text: "",
          linkProps: {
            href: ADMIN_ELM_URL + "/feasibilities",
            target: "_self",
          },
        },
      ];

  return (
    <DsfrHeader
      brandTop={
        <>
          république
          <br />
          française
        </>
      }
      homeLinkProps={{
        href: "/../",
        title: "Accueil - France VAE",
      }}
      operatorLogo={{
        alt: "France VAE",
        imgUrl: "/admin2/fvae_logo.svg",
        orientation: "horizontal",
      }}
      quickAccessItems={[
        {
          buttonProps: {
            onClick: () => logout(),
            className: "!text-sm !px-3 !py-1 !mb-4 !mx-1",
          },
          iconId: "ri-logout-box-r-line",
          text: "Se déconnecter",
        },
      ]}
      navigation={navigation}
    />
  );
};
