import { prismaClient } from "../../../prisma/client";
import {
  CandidacyStatusFilter,
  candidacyStatusFilters,
} from "../candidacy.types";
import { getStatusFromStatusFilter } from "../utils/candidacy.helper";

export const getCandidacyCountByStatusV2 = async ({
  hasRole,
  IAMId,
}: {
  hasRole(role: string): boolean;
  IAMId: string;
  searchFilter?: string;
}) => {
  if (!hasRole("admin") && !hasRole("manage_candidacy")) {
    throw new Error("Utilisateur non autorisé");
  }

  //get a count of candidacy by each status of candidacyCountByStatus in the select clause
  const selectClause = `select ${candidacyStatusFilters
    .map((sf) =>
      getSQLSelectSumClauseFromStatusFilter(sf as CandidacyStatusFilter),
    )
    .filter((s) => s)
    .join(", ")}`;
  let whereClause = "where 1=1";
  let fromClause = "from candidacy";

  //candidacy active status as activeCandidacyStatus
  fromClause +=
    " join candidacy_candidacy_status activeCandidacyStatus on (candidacy.id = activeCandidacyStatus.candidacy_id and activeCandidacyStatus.is_active = true)";

  //left join on candidacy drop out as candidacyDropOut
  fromClause +=
    " left join candidacy_drop_out candidacyDropOut on candidacy.id = candidacyDropOut.candidacy_id";

  //left join on active jury as activeJury
  fromClause +=
    " left join jury activeJury on candidacy.id = activeJury.candidacy_id and activeJury.is_active = true";

  //access rights
  if (!hasRole("admin")) {
    fromClause +=
      " join organism candidacyOrganism on candidacy.organism_id = candidacyOrganism.id";

    //gestionnaire maison mère
    if (hasRole("gestion_maison_mere_aap")) {
      fromClause +=
        " join maison_mere_aap mma on candidacyOrganism.maison_mere_aap_id = mma.id";
      fromClause +=
        " join account mmaAccount on mma.gestionnaire_account_id = mmaAccount.id";
      whereClause += ` and mmaAccount.keycloak_id = '${IAMId}'`;
    }
    //aap (manage_candidacy role) but not gestionnaire maison mère
    else {
      fromClause +=
        " join account candidacyOrganismAccount on candidacyOrganismAccount.organism_id = candidacyOrganism.id";
      whereClause += ` and candidacyOrganismAccount.keycloak_id = '${IAMId}'`;
    }
  }

  const query = `${selectClause} ${fromClause} ${whereClause}`;
  const [result] = (await prismaClient.$queryRawUnsafe(query)) as Array<object>;
  return result;
};

//get the sum clause for each status filter
const getSQLSelectSumClauseFromStatusFilter = (
  statusFilter: CandidacyStatusFilter,
) => {
  const getSumClause = (when: string) =>
    `sum(case when (${when}) then 1 else 0 end)::INTEGER AS "${statusFilter}"`;

  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
    case "PRISE_EN_CHARGE_HORS_ABANDON":
    case "PARCOURS_ENVOYE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON":
    case "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON":
    case "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON":
    case "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON":
    case "VALIDATION_HORS_ABANDON":
    case "PROJET_HORS_ABANDON": {
      const status = getStatusFromStatusFilter(statusFilter);

      if (status !== null) {
        return getSumClause(
          `activeCandidacyStatus.status = '${status}' and candidacyDropOut.candidacy_id is null`,
        );
      }
      break;
    }
    case "ACTIVE_HORS_ABANDON":
      return getSumClause(
        `activeCandidacyStatus.status not in ('ARCHIVE','PROJET','DOSSIER_FAISABILITE_NON_RECEVABLE')  and candidacyDropOut.candidacy_id is null`,
      );
    case "ABANDON":
      return getSumClause(`candidacyDropOut.candidacy_id is not null`);

    case "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION":
      return getSumClause(
        `activeCandidacyStatus.status = 'ARCHIVE' and candidacyDropOut.candidacy_id is null and candidacy.reorientation_reason_id is null`,
      );
    case "REORIENTEE":
      return getSumClause(
        `activeCandidacyStatus.status = 'ARCHIVE' and candidacy.reorientation_reason_id is not null`,
      );

    case "JURY_HORS_ABANDON":
      return getSumClause(
        `candidacyDropOut.candidacy_id  is null and activeJury.id is not null`,
      );

    case "JURY_PROGRAMME_HORS_ABANDON":
      return getSumClause(
        `candidacyDropOut.candidacy_id  is null and activeJury.id is not null and activeJury.date_of_result is null`,
      );

    case "JURY_PASSE_HORS_ABANDON":
      return getSumClause(
        `candidacyDropOut.candidacy_id  is null and activeJury.id is not null and activeJury.date_of_result is not null`,
      );
  }
};
