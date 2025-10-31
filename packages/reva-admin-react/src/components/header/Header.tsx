"use client";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

import { useFeatureflipping } from "../feature-flipping/featureFlipping";

const getCertificationAuthorityMetabaseUrlQuery = graphql(`
  query getCertificationAuthorityMetabaseUrl {
    account_getAccountForConnectedUser {
      certificationAuthority {
        metabaseDashboardIframeUrl
      }
    }
  }
`);

const getCohortesVaeCollectivesForConnectedAapQuery = graphql(`
  query getCohortesVaeCollectivesForConnectedAapForHeaderComponent {
    cohortesVaeCollectivesForConnectedAap {
      id
    }
  }
`);

const PATHS = {
  AAP_HELP: "/help",
  AGENCIES_SETTINGS: "/agencies-settings-v3",
  CANDIDACIES: "/candidacies",
  CERTIFICATEUR_HELP: "/certification-authorities/help",
  CERTIFICATION_AUTHORITIES_SETTINGS: "/certification-authorities/settings",
  CERTIFICATION_AUTHORITIES_SETTINGS_LOCAL:
    "/certification-authorities/settings/local-account",
  CERTIFICATION_AUTHORITY_STRUCTURES: "/certification-authority-structures",
  CERTIFICATIONS: "/certifications",
  FEASIBILITIES: "/candidacies/feasibilities",
  MAISON_MERE_AAP: "/maison-mere-aap",
  PORTEURS_DE_PROJET_VAE_COLLECTIVE: "/porteurs-de-projet-vae-collective",
  RESPONSABLE_CERTIFICATIONS: "/responsable-certifications/certifications",
  STATISTIQUES: "/dashboard",
  SUBSCRIPTIONS: "/subscriptions/pending",
  VAE_COLLECTIVES: "/vae-collectives",
} as const;

const LABELS = {
  AAP: "AAP",
  ADMIN_CERTIFICATION_AUTHORITY_CANDIDACIES: "Certificateurs/Candidatures",
  ANNUAIRES: "Annuaires",
  CANDIDACIES: "Candidatures",
  CERTIFICATION_AUTHORITY: "Certificateur",
  CERTIFICATIONS: "Certifications",
  GESTION_CERTIFICATIONS: "Gestion des certifications",
  HELP: "Aide",
  HELP_PAGES: "Pages d'aide",
  PARAMETRES: "Paramètres",
  PORTEURS_DE_PROJET_VAE_COLLECTIVE: "Porteurs de projet VAE collective",
  STATISTIQUES: "Statistiques",
  STRUCTURES_ACCOMPAGNATRICES: "Structures accompagnatrices",
  STRUCTURES_CERTIFICATRICES: "Structures certificatrices",
  VAE_COLLECTIVES: "VAE collectives",
  VERIFICATIONS: "Vérifications",
} as const;

const createTab = ({
  text,
  href,
  isActive,
  additionalProps = {},
}: {
  text: string;
  href: string;
  isActive: boolean;
  additionalProps?: Record<string, unknown>;
}) => ({
  text,
  linkProps: { href, target: "_self", ...additionalProps },
  isActive,
});

const isAAPCandidaciesPath = (pathname: string) => {
  const exclusionPattern =
    /\/candidacies\/(?!(dossiers-de-validation|feasibilities|juries)\/).*/;
  const subPathPattern =
    /\/candidacies\/.*\/(feasibility\/)|(dossier-de-validation\/)|(jury\/)|(transfer.*\/)/;

  return !!pathname.match(exclusionPattern) && !pathname.match(subPathPattern);
};

const isAAPVaeCollectivesPath = (pathname: string) =>
  !!pathname.match(/^\/vae-collectives/);

const isCertificationAuthorityCandidaciesPath = (pathname: string) => {
  const mainPattern =
    /\/candidacies\/(feasibilities)|(dossiers-de-validation)|(juries)/;
  const subPathPattern =
    /\/candidacies\/.*\/(feasibility\/)|(dossier-de-validation\/)|(jury\/)|(transfer.*\/)/;

  return !!(pathname.match(mainPattern) || pathname.match(subPathPattern));
};

const getNavigationTabs = ({
  currentPathname,
  isAdmin,
  isOrganism,
  isGestionnaireMaisonMereAAP,
  isCertificationAuthorityLocalAccount,
  isCertificationRegistryManager,
  isAdminCertificationAuthority,
  metabaseDashboardIframeUrl,
  showAAPVaeCollectivesTab,
  showPorteursDeProjetVaeCollectiveMenu,
  showAAPAideTab,
  showCertificateurAideTab,
}: {
  currentPathname: string;
  isAdmin: boolean;
  isOrganism: boolean;
  isGestionnaireMaisonMereAAP: boolean;
  isCertificationAuthorityLocalAccount: boolean;
  isCertificationRegistryManager: boolean;
  isAdminCertificationAuthority: boolean;
  metabaseDashboardIframeUrl?: string | null;
  showAAPVaeCollectivesTab: boolean;
  showPorteursDeProjetVaeCollectiveMenu: boolean;
  showAAPAideTab: boolean;
  showCertificateurAideTab: boolean;
}) => {
  const adminTabs = [
    createTab({
      text: LABELS.CANDIDACIES,
      href: PATHS.CANDIDACIES,
      isActive: isAAPCandidaciesPath(currentPathname),
    }),
    createTab({
      text: LABELS.CERTIFICATIONS,
      href: PATHS.CERTIFICATIONS,
      isActive: currentPathname.startsWith(PATHS.CERTIFICATIONS),
    }),
    createTab({
      text: LABELS.VERIFICATIONS,
      href: PATHS.SUBSCRIPTIONS,
      isActive: currentPathname.startsWith(PATHS.SUBSCRIPTIONS),
    }),
    {
      text: LABELS.ANNUAIRES,
      isActive: [
        PATHS.MAISON_MERE_AAP,
        PATHS.CERTIFICATION_AUTHORITY_STRUCTURES,
      ].some((path) => currentPathname.startsWith(path)),
      menuLinks: [
        createTab({
          text: LABELS.STRUCTURES_ACCOMPAGNATRICES,
          href: PATHS.MAISON_MERE_AAP,
          isActive: currentPathname.startsWith(PATHS.MAISON_MERE_AAP),
          additionalProps: { "data-testid": "maison-mere-aap-link" },
        }),
        createTab({
          text: LABELS.STRUCTURES_CERTIFICATRICES,
          href: PATHS.CERTIFICATION_AUTHORITY_STRUCTURES,
          isActive: currentPathname.startsWith(
            PATHS.CERTIFICATION_AUTHORITY_STRUCTURES,
          ),
        }),
        ...(showPorteursDeProjetVaeCollectiveMenu
          ? [
              createTab({
                text: LABELS.PORTEURS_DE_PROJET_VAE_COLLECTIVE,
                href: PATHS.PORTEURS_DE_PROJET_VAE_COLLECTIVE,
                isActive: currentPathname.startsWith(
                  PATHS.PORTEURS_DE_PROJET_VAE_COLLECTIVE,
                ),
              }),
            ]
          : []),
      ],
    },
    createTab({
      text: LABELS.ADMIN_CERTIFICATION_AUTHORITY_CANDIDACIES,
      href: PATHS.FEASIBILITIES,
      isActive: isCertificationAuthorityCandidaciesPath(currentPathname),
    }),
    {
      text: LABELS.HELP_PAGES,
      menuLinks: [
        ...(showAAPAideTab
          ? [
              createTab({
                text: LABELS.AAP,
                href: PATHS.AAP_HELP,
                isActive: currentPathname.startsWith(PATHS.AAP_HELP),
              }),
            ]
          : []),
        ...(showCertificateurAideTab
          ? [
              createTab({
                text: LABELS.CERTIFICATION_AUTHORITY,
                href: PATHS.CERTIFICATEUR_HELP,
                isActive: currentPathname.startsWith(PATHS.CERTIFICATEUR_HELP),
              }),
            ]
          : []),
      ],
    },
  ];

  const aapTabs = [
    createTab({
      text: LABELS.CANDIDACIES,
      href: PATHS.CANDIDACIES,
      isActive: isAAPCandidaciesPath(currentPathname),
    }),
    ...(showAAPVaeCollectivesTab
      ? [
          createTab({
            text: LABELS.VAE_COLLECTIVES,
            href: PATHS.VAE_COLLECTIVES,
            isActive: isAAPVaeCollectivesPath(currentPathname),
          }),
        ]
      : []),
    createTab({
      text: LABELS.PARAMETRES,
      href: PATHS.AGENCIES_SETTINGS,
      isActive: currentPathname.startsWith("/agencies-settings"),
    }),
    ...(showAAPAideTab
      ? [
          createTab({
            text: LABELS.HELP,
            href: PATHS.AAP_HELP,
            isActive: currentPathname.startsWith(PATHS.AAP_HELP),
          }),
        ]
      : []),
  ];

  const registryManagerTabs = [
    createTab({
      text: LABELS.GESTION_CERTIFICATIONS,
      href: PATHS.RESPONSABLE_CERTIFICATIONS,
      isActive: currentPathname.startsWith(PATHS.RESPONSABLE_CERTIFICATIONS),
    }),
    ...(showCertificateurAideTab
      ? [
          createTab({
            text: LABELS.HELP,
            href: PATHS.CERTIFICATEUR_HELP,
            isActive: currentPathname.startsWith(PATHS.CERTIFICATEUR_HELP),
          }),
        ]
      : []),
  ];

  const certificationAuthorityAdminTabs = [
    createTab({
      text: LABELS.CANDIDACIES,
      href: PATHS.FEASIBILITIES,
      isActive: isCertificationAuthorityCandidaciesPath(currentPathname),
    }),
    createTab({
      text: LABELS.PARAMETRES,
      href: PATHS.CERTIFICATION_AUTHORITIES_SETTINGS,
      isActive: currentPathname.startsWith(
        PATHS.CERTIFICATION_AUTHORITIES_SETTINGS,
      ),
    }),
    ...(showCertificateurAideTab
      ? [
          createTab({
            text: LABELS.HELP,
            href: PATHS.CERTIFICATEUR_HELP,
            isActive: currentPathname.startsWith(PATHS.CERTIFICATEUR_HELP),
          }),
        ]
      : []),
    ...(metabaseDashboardIframeUrl
      ? [
          createTab({
            text: LABELS.STATISTIQUES,
            href: PATHS.STATISTIQUES,
            isActive: currentPathname.startsWith(PATHS.STATISTIQUES),
          }),
        ]
      : []),
  ];

  const certificationAuthorityLocalAccountTabs = [
    createTab({
      text: LABELS.CANDIDACIES,
      href: PATHS.FEASIBILITIES,
      isActive: isCertificationAuthorityCandidaciesPath(currentPathname),
    }),
    createTab({
      text: LABELS.PARAMETRES,
      href: PATHS.CERTIFICATION_AUTHORITIES_SETTINGS_LOCAL,
      isActive: currentPathname.startsWith(
        PATHS.CERTIFICATION_AUTHORITIES_SETTINGS_LOCAL,
      ),
    }),
    ...(showCertificateurAideTab
      ? [
          createTab({
            text: LABELS.HELP,
            href: PATHS.CERTIFICATEUR_HELP,
            isActive: currentPathname.startsWith(PATHS.CERTIFICATEUR_HELP),
          }),
        ]
      : []),
  ];

  switch (true) {
    case isAdmin:
      return adminTabs;
    case isGestionnaireMaisonMereAAP:
    case isOrganism:
      return aapTabs;
    case isCertificationAuthorityLocalAccount:
      return certificationAuthorityLocalAccountTabs;
    case isCertificationRegistryManager:
      return registryManagerTabs;
    case isAdminCertificationAuthority:
      return certificationAuthorityAdminTabs;
    default:
      return [];
  }
};

export const Header = () => {
  const currentPathname = usePathname();
  const {
    isAdmin,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority,
    isCertificationRegistryManager,
    isCertificationAuthorityLocalAccount,
  } = useAuth();
  const { logout } = useKeycloakContext();

  const { graphqlClient } = useGraphQlClient();

  const { isFeatureActive } = useFeatureflipping();

  const { data: getCertificationAuthorityMetabaseUrl } = useQuery({
    queryKey: ["certificateur", "getCertificationAuthorityMetabaseUrl"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityMetabaseUrlQuery),
    enabled: !isOrganism && !isGestionnaireMaisonMereAAP && !isAdmin,
  });

  const metabaseDashboardIframeUrl =
    getCertificationAuthorityMetabaseUrl?.account_getAccountForConnectedUser
      ?.certificationAuthority?.metabaseDashboardIframeUrl;

  const isVaeCollectiveFeatureActive = isFeatureActive("VAE_COLLECTIVE");
  const isAAPAideFeatureActive = isFeatureActive("AAP_HELP");
  const isCertificateurAideFeatureActive =
    isFeatureActive("CERTIFICATEUR_HELP");

  const { data: getCohortesVaeCollectivesForConnectedAap } = useQuery({
    queryKey: ["aap", "getCohortesVaeCollectivesForConnectedAap"],
    queryFn: () =>
      graphqlClient.request(getCohortesVaeCollectivesForConnectedAapQuery),
    enabled: isVaeCollectiveFeatureActive && isOrganism && !isAdmin,
  });

  const showAAPVaeCollectivesTab =
    isVaeCollectiveFeatureActive &&
    isOrganism &&
    !isAdmin &&
    !!getCohortesVaeCollectivesForConnectedAap
      ?.cohortesVaeCollectivesForConnectedAap?.length;

  const showPorteursDeProjetVaeCollectiveMenu = isVaeCollectiveFeatureActive;

  const showAAPAideTab = isAAPAideFeatureActive;
  const showCertificateurAideTab = isCertificateurAideFeatureActive;

  const navigation = getNavigationTabs({
    currentPathname,
    isAdmin,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isCertificationAuthorityLocalAccount,
    isCertificationRegistryManager,
    isAdminCertificationAuthority,
    metabaseDashboardIframeUrl,
    showAAPVaeCollectivesTab,
    showPorteursDeProjetVaeCollectiveMenu,
    showAAPAideTab,
    showCertificateurAideTab,
  });

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
