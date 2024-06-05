import {
  CandidacyCountByStatus,
  CandidacyStatusFilter,
} from "@/graphql/generated/graphql";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

const CandidacyLayoutSideMenu = ({
  candidaciesByStatusCount,
}: {
  candidaciesByStatusCount: CandidacyCountByStatus;
}) => {
  const searchParams = useSearchParams();
  const candidacyStatus = searchParams.get("status");
  const searchFilter = searchParams.get("search") || "";

  const hrefSideMenu = (status: CandidacyStatusFilter) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("status", status);

    if (searchFilter) {
      params.set("search", searchFilter);
    }

    return `/candidacies?${params.toString()}`;
  };

  const isActive = (status: CandidacyStatusFilter) =>
    candidacyStatus === status;

  return (
    <nav
      role="navigation"
      aria-label="Menu latéral"
      className="fr-sidemenu bg-white md:h-full w-full md:max-w-[450px] mb-2 flex-shrink-0"
    >
      <SideMenu
        align="left"
        burgerMenuButtonText="Candidatures"
        items={[
          {
            linkProps: {
              href: hrefSideMenu("ACTIVE_HORS_ABANDON"),
            },
            expandedByDefault: true,
            isActive: isActive("ACTIVE_HORS_ABANDON"),
            text: `Toutes les candidatures actives (${candidaciesByStatusCount?.ACTIVE_HORS_ABANDON ?? 0})`,
            items: [
              {
                linkProps: {
                  href: hrefSideMenu("VALIDATION_HORS_ABANDON"),
                },
                text: `Nouvelles candidatures (${candidaciesByStatusCount?.VALIDATION_HORS_ABANDON ?? 0})`,
                isActive: isActive("VALIDATION_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu("PRISE_EN_CHARGE_HORS_ABANDON"),
                },
                text: `Candidatures prises en charge (${candidaciesByStatusCount?.PRISE_EN_CHARGE_HORS_ABANDON ?? 0})`,
                isActive: isActive("PRISE_EN_CHARGE_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu("PARCOURS_ENVOYE_HORS_ABANDON"),
                },
                text: `Parcours envoyés (${candidaciesByStatusCount?.PARCOURS_ENVOYE_HORS_ABANDON ?? 0})`,
                isActive: isActive("PARCOURS_ENVOYE_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu("PARCOURS_CONFIRME_HORS_ABANDON"),
                },
                text: `Parcours confirmés par le candidat (${candidaciesByStatusCount?.PARCOURS_CONFIRME_HORS_ABANDON ?? 0})`,
                isActive: isActive("PARCOURS_CONFIRME_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu("DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON"),
                },
                text: `Dossiers de faisabilité envoyés (${candidaciesByStatusCount?.DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON ?? 0})`,
                isActive: isActive("DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu(
                    "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON",
                  ),
                },
                text: `Dossiers de faisabilité incomplets (${candidaciesByStatusCount?.DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON ?? 0})`,
                isActive: isActive(
                  "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON",
                ),
              },
              {
                linkProps: {
                  href: hrefSideMenu(
                    "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON",
                  ),
                },
                text: `Dossiers de faisabilité recevables (${candidaciesByStatusCount?.DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON ?? 0})`,
                isActive: isActive(
                  "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON",
                ),
              },
              {
                linkProps: {
                  href: hrefSideMenu("DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON"),
                },
                text: `Demandes de prise en charge envoyées (${candidaciesByStatusCount?.DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON ?? 0})`,
                isActive: isActive("DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu(
                    "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON",
                  ),
                },
                text: `Dossiers de validation envoyés (${candidaciesByStatusCount?.DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON ?? 0})`,
                isActive: isActive("DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu(
                    "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON",
                  ),
                },
                text: `Dossiers de validation signalés (${candidaciesByStatusCount?.DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON ?? 0})`,
                isActive: isActive(
                  "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON",
                ),
              },
              {
                linkProps: {
                  href: hrefSideMenu("DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON"),
                },
                text: `Demandes de paiement envoyées (${candidaciesByStatusCount?.DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON ?? 0})`,
                isActive: isActive("DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON"),
              },
            ],
          },
          {
            text: `Toutes les candidatures en jury (${candidaciesByStatusCount?.JURY_HORS_ABANDON ?? 0})`,
            linkProps: {
              href: hrefSideMenu("JURY_HORS_ABANDON"),
            },
            items: [
              {
                linkProps: {
                  href: hrefSideMenu("JURY_PROGRAMME_HORS_ABANDON"),
                },
                text: `Jurys programmés (${candidaciesByStatusCount?.JURY_PROGRAMME_HORS_ABANDON ?? 0})`,
                isActive: isActive("JURY_PROGRAMME_HORS_ABANDON"),
              },
              {
                linkProps: {
                  href: hrefSideMenu("JURY_PASSE_HORS_ABANDON"),
                },
                text: `Résultats renseignés (${candidaciesByStatusCount?.JURY_PASSE_HORS_ABANDON ?? 0})`,
                isActive: isActive("JURY_PASSE_HORS_ABANDON"),
              },
            ],
            isActive: isActive("JURY_HORS_ABANDON"),
          },

          {
            text: `Toutes les candidatures non recevables (${candidaciesByStatusCount?.DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON ?? 0})`,
            linkProps: {
              href: hrefSideMenu(
                "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON",
              ),
            },
            isActive: isActive(
              "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON",
            ),
          },
          {
            text: `Toutes les candidatures abandonnées (${candidaciesByStatusCount?.ABANDON ?? 0})`,
            linkProps: {
              href: hrefSideMenu("ABANDON"),
            },
            isActive: isActive("ABANDON"),
          },
          {
            text: `Toutes les candidatures réorientées (${candidaciesByStatusCount?.REORIENTEE ?? 0})`,
            linkProps: {
              href: hrefSideMenu("REORIENTEE"),
            },
            isActive: isActive("REORIENTEE"),
          },
          {
            text: `Toutes les candidatures supprimées (${candidaciesByStatusCount?.ARCHIVE_HORS_ABANDON_HORS_REORIENTATION ?? 0})`,
            linkProps: {
              href: hrefSideMenu("ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"),
            },
            isActive: isActive("ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"),
          },
          {
            text: `Tous les projets en cours d'édition (${candidaciesByStatusCount?.PROJET_HORS_ABANDON ?? 0})`,
            linkProps: {
              href: hrefSideMenu("PROJET_HORS_ABANDON"),
            },
            isActive: isActive("PROJET_HORS_ABANDON"),
          },
        ]}
      />
    </nav>
  );
};

export const CandidaciesLayout = ({
  children,
  candidaciesByStatusCount,
}: {
  children: ReactNode;
  candidaciesByStatusCount: CandidacyCountByStatus;
}) => (
  <div className="flex flex-col md:flex-row w-full">
    <CandidacyLayoutSideMenu
      candidaciesByStatusCount={candidaciesByStatusCount}
    />
    <div className="w-full">{children}</div>
  </div>
);
