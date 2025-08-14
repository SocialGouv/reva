import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";

import { CandidacyStatusFilter } from "@/graphql/generated/graphql";

export const VaeCollectivesSideMenu = ({
  cohortes,
  searchFilter,
  statusFilter,
}: {
  cohortes: { id: string; nom: string }[];
  searchFilter: string;
  statusFilter: CandidacyStatusFilter;
}) => (
  <nav
    role="navigation"
    aria-label="Menu latéral"
    className="flex flex-col gap-4"
  >
    <SideMenu
      className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
      align="left"
      burgerMenuButtonText="Candidatures"
      items={cohortes.map((cohorte) => ({
        text: cohorte.nom,
        linkProps: { href: `/vae-collectives` },
        items: [
          {
            text: "Candidatures actives",
            linkProps: {
              href: `/vae-collectives?cohorte_id=${cohorte.id}&status=ACTIVE_HORS_ABANDON&search=${searchFilter}`,
            },
            isActive: statusFilter === "ACTIVE_HORS_ABANDON",
          },
          {
            text: "Candidatures en jury",
            linkProps: {
              href: `/vae-collectives?cohorte_id=${cohorte.id}&status=JURY_HORS_ABANDON&search=${searchFilter}`,
            },
            isActive: statusFilter === "JURY_HORS_ABANDON",
          },
          {
            text: "Candidatures non recevables",
            linkProps: {
              href: `/vae-collectives?cohorte_id=${cohorte.id}&status=DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON&search=${searchFilter}`,
            },
            isActive:
              statusFilter === "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON",
          },
          {
            text: "Candidatures abandonnées",
            linkProps: {
              href: `/vae-collectives?cohorte_id=${cohorte.id}&status=ABANDON&search=${searchFilter}`,
            },
            isActive: statusFilter === "ABANDON",
          },
          {
            text: "Candidatures réorientées",
            linkProps: {
              href: `/vae-collectives?cohorte_id=${cohorte.id}&status=REORIENTEE&search=${searchFilter}`,
            },
            isActive: statusFilter === "REORIENTEE",
          },
        ],
      }))}
    />
  </nav>
);
