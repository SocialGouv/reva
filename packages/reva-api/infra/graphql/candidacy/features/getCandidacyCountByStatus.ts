import { prismaClient } from "../../../database/postgres/client";

export const getCandidacyCountByStatus = async () => {
  type MappedStatus =
    | "ACTIVE_HORS_ABANDON"
    | "ABANDON"
    | "REORIENTEE_HORS_ABANDON"
    | "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"
    | "PARCOURS_CONFIRME_HORS_ABANDON"
    | "PRISE_EN_CHARGE_HORS_ABANDON"
    | "PARCOURS_ENVOYE_HORS_ABANDON"
    | "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON"
    | "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON"
    | "VALIDATION_HORS_ABANDON"
    | "PROJET_HORS_ABANDON";

  const candidacyCountByStatus: Record<MappedStatus, number> = {
    ACTIVE_HORS_ABANDON: 0,
    ABANDON: 0,
    REORIENTEE_HORS_ABANDON: 0,
    ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 0,
    PARCOURS_CONFIRME_HORS_ABANDON: 0,
    PRISE_EN_CHARGE_HORS_ABANDON: 0,
    PARCOURS_ENVOYE_HORS_ABANDON: 0,
    DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON: 0,
    DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON: 0,
    VALIDATION_HORS_ABANDON: 0,
    PROJET_HORS_ABANDON: 0,
  };

  const candidacyCountByStatusFromDb: {
    status: MappedStatus;
    count: bigint;
  }[] = await prismaClient.$queryRaw`
    select 'ACTIVE_HORS_ABANDON' as status, count(candidacy_id) from candidacy_candidacy_status where status!='ARCHIVE' AND STATUS!='PROJET' and is_active=true and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id = candidacy_candidacy_status.candidacy_id)
    UNION
    select status::VARCHAR||'_HORS_ABANDON' as status, count (status) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status in ('PARCOURS_CONFIRME', 'PRISE_EN_CHARGE', 'PARCOURS_ENVOYE', 'DEMANDE_FINANCEMENT_ENVOYE', 'DEMANDE_PAIEMENT_ENVOYEE', 'VALIDATION', 'PROJET') and is_active=true and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id = candidacy_candidacy_status.candidacy_id) group by status
    UNION
    select 'ABANDON' as status, count(candidacy_id) from candidacy_drop_out
    UNION
    select 'ARCHIVE_HORS_ABANDON_HORS_REORIENTATION' as status, count (status) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status='ARCHIVE' and
    is_active=true and candidacy.reorientation_reason_id is null and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id = candidacy_candidacy_status.candidacy_id) group by status
    UNION
    select 'REORIENTEE_HORS_ABANDON' as status, count (status) from candidacy_candidacy_status join candidacy on candidacy.id = candidacy_candidacy_status.candidacy_id where status='ARCHIVE' and
    is_active=true and candidacy.reorientation_reason_id is not null and not EXISTS (select candidacy_id from candidacy_drop_out where candidacy_id = candidacy_candidacy_status.candidacy_id) group by status;
    `;

  candidacyCountByStatusFromDb.forEach((csc) => {
    if (csc.status in candidacyCountByStatus) {
      candidacyCountByStatus[csc.status as MappedStatus] = Number(csc.count);
    }
  });
  return candidacyCountByStatus;
};
