"use client";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { ADMIN_ELM_URL } from "@/config/config";

export const Header = () => {
  const currentPathname = usePathname();
  const {
    isAdmin,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isCertificationAuthority,
    isAdminCertificationAuthority,
    isCertificationRegistryManager,
  } = useAuth();
  const { authenticated, logout } = useKeycloakContext();

  const candidaciesLabel = isAdmin
    ? "Certificateurs/Candidatures"
    : "Candidatures";

  const isCertificationAuthorityLocalAccount =
    isCertificationAuthority && !isAdminCertificationAuthority;

  const adminTabs = [
    {
      text: "Certifications",
      linkProps: {
        href: "/certifications",
        target: "_self",
      },
      isActive: currentPathname.startsWith("/certifications"),
    },
    {
      text: "Vérifications",
      linkProps: {
        href: "/subscriptions/pending",
        target: "_self",
      },
      isActive: currentPathname.startsWith("/subscriptions"),
    },
    {
      text: "Annuaires",
      isActive: [
        "/maison-mere-aap",
        "/certification-authority-structures",
      ].some((path) => currentPathname.startsWith(path)),
      menuLinks: [
        {
          text: "Structures accompagnatrices",
          linkProps: {
            "data-test": "maison-mere-aap-link",
            href: "/maison-mere-aap",
            target: "_self",
          },
          isActive: currentPathname.startsWith("/maison-mere-aap"),
        },
        {
          text: "Structures certificatrices",
          linkProps: {
            href: "/certification-authority-structures",
            target: "_self",
          },
          isActive: currentPathname.startsWith(
            "/certification-authority-structures",
          ),
        },
      ],
    },
  ];

  const registryManagerTabs = [
    {
      text: "Gestion des certifications",
      linkProps: {
        href: "/responsable-certifications/certifications",
        target: "_self",
      },
      isActive: currentPathname.startsWith("/responsable-certifications"),
    },
  ];

  const adminCertificationAuthorityTabs = [
    {
      text: candidaciesLabel,
      linkProps: {
        href: "/candidacies/feasibilities",
        target: "_self",
      },
      isActive: !!(
        currentPathname.match(
          /\/candidacies\/(feasibilities)|(dossiers-de-validation)|(juries)|(caducites)/,
        ) ||
        currentPathname.match(
          /\/candidacies\/.*\/(feasibility\/)|(dossier-de-validation\/)|(jury\/)|(transfer.*\/)/,
        )
      ),
    },
    {
      text: "Paramètres",
      linkProps: {
        href: "/certification-authorities/settings/",
        target: "_self",
      },
      isActive: currentPathname.startsWith(
        "/certification-authorities/settings",
      ),
    },
  ];

  const navigation = authenticated
    ? [
        ...(isAdmin || isOrganism || isGestionnaireMaisonMereAAP
          ? [
              {
                text: "Candidatures",
                linkProps: {
                  href: "/candidacies",
                },
                // This isActive flag is set to true only for the AAP tab under candidacies,
                // excluding specific subpaths like dossiers-de-validation, feasibilities, and juries
                // which belong to the certification authorities' candidacies.
                isActive:
                  !!currentPathname.match(
                    /\/candidacies\/(?!(dossiers-de-validation|feasibilities|juries|caducites)\/).*/,
                  ) &&
                  !currentPathname.match(
                    /\/candidacies\/.*\/(feasibility\/)|(dossier-de-validation\/)|(jury\/)|(transfer.*\/)/,
                  ),
              },
            ]
          : []),

        ...(!isAdmin && (isOrganism || isGestionnaireMaisonMereAAP)
          ? [
              {
                text: "Paramètres",
                linkProps: {
                  href: "/agencies-settings-v3",
                  target: "_self",
                },
                isActive: currentPathname.startsWith("/agencies-settings"),
              },
            ]
          : []),
        ...(isAdmin ? adminTabs : []),
        ...(isAdmin || isCertificationAuthorityLocalAccount
          ? [
              {
                text: candidaciesLabel,
                linkProps: {
                  href: "/candidacies/feasibilities",
                  target: "_self",
                },
                isActive: !!(
                  currentPathname.match(
                    /\/candidacies\/(feasibilities)|(dossiers-de-validation)|(juries)|(caducites)/,
                  ) ||
                  currentPathname.match(
                    /\/candidacies\/.*\/(feasibility\/)|(dossier-de-validation\/)|(jury\/)|(transfer.*\/)/,
                  )
                ),
              },
            ]
          : []),
        ...(isCertificationRegistryManager ? registryManagerTabs : []),
        ...(isAdminCertificationAuthority
          ? adminCertificationAuthorityTabs
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
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
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
      serviceTitle={
        isCertificationRegistryManager
          ? "Espace Responsable des certifications"
          : ""
      }
    />
  );
};
