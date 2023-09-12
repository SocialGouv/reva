import { prismaClient } from "../../../prisma/client";
import { CandidacyStatusFilter } from "../candidacy.types";

export const getCandidacyCountByStatus = async ({
  hasRole,
  IAMId,
}: {
  hasRole(role: string): boolean;
  IAMId: string;
}) => {
  const candidacyCountByStatus: Record<CandidacyStatusFilter, number> = {
    ACTIVE_HORS_ABANDON: 0,
    ABANDON: 0,
    REORIENTEE: 0,
    ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 0,
    PARCOURS_CONFIRME_HORS_ABANDON: 0,
    PRISE_EN_CHARGE_HORS_ABANDON: 0,
    PARCOURS_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON: 0,
    DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON: 0,
    DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON: 0,
    VALIDATION_HORS_ABANDON: 0,
    PROJET_HORS_ABANDON: 0,
  };

  if (hasRole("admin") || hasRole("manage_candidacy")) {
    let organismSelectionWhereClause = "";
    if (!hasRole("admin") && hasRole("manage_candidacy")) {
      organismSelectionWhereClause = `and EXISTS (select organism.id from organism , account where account.organism_id=organism.id and organism.id=candidacy.organism_id and account.keycloak_id='${IAMId}')`;
    }

    const activeHorsAbandonQuery = `select 'ACTIVE_HORS_ABANDON' as status, count(candidacy_id) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status!='ARCHIVE' AND STATUS!='PROJET' and STATUS!='DOSSIER_FAISABILITE_NON_RECEVABLE' and is_active=true and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id=candidacy.id) ${organismSelectionWhereClause}`;

    const countByactiveStatusHorsAbandonQuery = `select status::VARCHAR||'_HORS_ABANDON' as status, count (status) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status in ('PARCOURS_CONFIRME', 'PRISE_EN_CHARGE', 'PARCOURS_ENVOYE', 'DOSSIER_FAISABILITE_ENVOYE', 'DOSSIER_FAISABILITE_RECEVABLE', 'DOSSIER_FAISABILITE_NON_RECEVABLE', 'DEMANDE_FINANCEMENT_ENVOYE', 'DEMANDE_PAIEMENT_ENVOYEE', 'VALIDATION', 'PROJET') and is_active=true and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id=candidacy.id) ${organismSelectionWhereClause} group by status`;

    const abandonQuery = `select 'ABANDON' as status, count(candidacy_id) from candidacy_drop_out join candidacy on candidacy.id = candidacy_drop_out.candidacy_id where true ${organismSelectionWhereClause}`;

    const archiveHorsAbandonHorsReorientationQuery = `select 'ARCHIVE_HORS_ABANDON_HORS_REORIENTATION' as status, count (status) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status='ARCHIVE' and
    is_active=true and candidacy.reorientation_reason_id is null and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id=candidacy.id) ${organismSelectionWhereClause} group by status`;

    const reorienteQuery = `select 'REORIENTEE' as status, count (status) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status='ARCHIVE' and
    is_active=true and candidacy.reorientation_reason_id is not null ${organismSelectionWhereClause} group by status;`;

    const query = `
    ${activeHorsAbandonQuery}
    UNION ${countByactiveStatusHorsAbandonQuery} 
    UNION ${abandonQuery} 
    UNION ${archiveHorsAbandonHorsReorientationQuery} 
    UNION ${reorienteQuery}`;

    const candidacyCountByStatusFromDb: {
      status: CandidacyStatusFilter;
      count: bigint;
    }[] = await prismaClient.$queryRawUnsafe(query);

    candidacyCountByStatusFromDb.forEach((csc) => {
      if (csc.status in candidacyCountByStatus) {
        candidacyCountByStatus[csc.status as CandidacyStatusFilter] = Number(
          csc.count
        );
      }
    });
    return candidacyCountByStatus;
  } else {
    return [];
  }
};
