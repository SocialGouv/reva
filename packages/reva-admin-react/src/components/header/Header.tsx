"use client";
import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { ADMIN_ELM_URL } from "@/config/config";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";
import { useFeatureflipping } from "../feature-flipping/featureFlipping";

export const Header = () => {
  const currentPathname = usePathname();
  const { isFeatureActive } = useFeatureflipping();
  const isSettingsEnabled = isFeatureActive("AAP_SETTINGS_V3");
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
  const isAdminDashboardV2Enabled = isFeatureActive("admin_dashboard_v2");
  const certificateursPath = isFeatureActive(
    "NEW_CERTIFICATION_AUTHORITY_ADMINISTRATION_PAGES",
  )
    ? "/certification-authority-structures"
    : "/certification-authorities";

  const adminTabsV1 = [
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
      isActive: currentPathname.startsWith("/certifications"),
    },
    {
      text: "Certificateurs",
      linkProps: {
        href: isFeatureActive(
          "NEW_CERTIFICATION_AUTHORITY_ADMINISTRATION_PAGES",
        )
          ? "/certification-authority-structures"
          : "/certification-authorities",
        target: "_self",
      },
      isActive: currentPathname.startsWith("/certification-authorities"),
    },
  ];
  const adminTabsV2 = [
    {
      text: "Certifications",
      linkProps: {
        href: "/certifications",
        target: "_self",
      },
      isActive: currentPathname.startsWith("/certifications"),
    },
    {
      text: "Annuaires",
      isActive: [
        "/maison-mere-aap",
        "/certification-authority-structures",
        "/subscriptions",
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
            href: certificateursPath,
            target: "_self",
          },
          isActive: currentPathname.startsWith(certificateursPath),
        },
        {
          text: "Inscriptions",
          linkProps: {
            href: "/subscriptions/pending",
            target: "_self",
          },
          isActive: currentPathname.startsWith("/subscriptions"),
        },
      ],
    },
  ];

  const adminTabs = isAdminDashboardV2Enabled ? adminTabsV2 : adminTabsV1;

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
                isActive: !!currentPathname.match(
                  /\/candidacies\/(?!(dossiers-de-validation|feasibilities|juries)\/).*/,
                ),
              },
            ]
          : []),

        ...(!isAdmin && (isOrganism || isGestionnaireMaisonMereAAP)
          ? [
              {
                text: "Paramètres",
                linkProps: {
                  href: isSettingsEnabled
                    ? "/agencies-settings-v3"
                    : "/agencies-settings/legal-information",
                  target: "_self",
                },
                isActive: currentPathname.startsWith("/agencies-settings"),
              },
            ]
          : []),
        ...(isAdmin ? adminTabs : []),
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
                    /\/candidacies\/.*\/(feasibility\/)|(dossier-de-validation\/)|(jury\/)/,
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
    />
  );
};
