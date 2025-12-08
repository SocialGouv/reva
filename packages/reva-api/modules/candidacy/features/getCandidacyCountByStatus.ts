import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import {
  CandidacyStatusFilter,
  candidacyStatusFilters,
} from "../candidacy.types";
import { getStatusFromStatusFilter } from "../utils/candidacy.helper";

export const getCandidacyCountByStatus = async ({
  hasRole,
  IAMId,
  searchFilter,
  maisonMereAAPId,
  cohorteVaeCollectiveId,
}: {
  hasRole(role: string): boolean;
  IAMId: string;
  searchFilter?: string;
  maisonMereAAPId?: string;
  cohorteVaeCollectiveId?: string;
}) => {
  if (!hasRole("admin") && !hasRole("manage_candidacy")) {
    throw new Error("Utilisateur non autorisé");
  }

  //get a count of candidacy by each status of candidacyCountByStatus in the select clause
  //no need to escape query parameters since they are not user inputs
  const selectClause = Prisma.raw(
    `select ${candidacyStatusFilters
      .map((sf) =>
        getSQLSelectSumClauseFromStatusFilter(sf as CandidacyStatusFilter),
      )
      .filter((s) => s)
      .join(", ")}`,
  );
  let whereClause = Prisma.sql`where 1=1`;
  let fromClause = Prisma.sql`from candidacy`;

  //candidacy candidateId is not null
  whereClause = Prisma.sql`${whereClause} and candidacy.candidate_id IS NOT NULL`;

  //candidacy organism as candidacyOrganism
  fromClause = Prisma.sql`${fromClause} left join organism candidacyOrganism on candidacy.organism_id = candidacyOrganism.id`;

  //left join on candidacy drop out as candidacyDropOut
  fromClause = Prisma.sql`${fromClause} left join candidacy_drop_out candidacyDropOut on candidacy.id = candidacyDropOut.candidacy_id`;

  //left join on active jury as activeJury
  fromClause = Prisma.sql`${fromClause} left join jury activeJury on candidacy.id = activeJury.candidacy_id and activeJury.is_active = true`;

  //left join on funding request as fundingRequest
  fromClause = Prisma.sql`${fromClause} left join funding_request fundingRequest on candidacy.id = fundingRequest.candidacy_id`;

  //left join on funding request as fundingRequestUnifvae
  fromClause = Prisma.sql`${fromClause} left join funding_request_unifvae fundingRequestUnifvae on candidacy.id = fundingRequestUnifvae.candidacy_id`;

  //left join on payment request as paymentRequest
  fromClause = Prisma.sql`${fromClause} left join payment_request paymentRequest on candidacy.id = paymentRequest.candidacy_id`;

  //left join on payment request as paymentRequestUnifvae
  fromClause = Prisma.sql`${fromClause} left join payment_request_unifvae paymentRequestUnifvae on candidacy.id = paymentRequestUnifvae.candidacy_id`;

  //filter on cohorteVaeCollectiveId if provided
  if (cohorteVaeCollectiveId) {
    whereClause = Prisma.sql`${whereClause} and candidacy.cohorte_vae_collective_id = ${cohorteVaeCollectiveId}::uuid`;
  }

  //access rights
  if (!hasRole("admin")) {
    //gestionnaire maison mère
    if (hasRole("gestion_maison_mere_aap")) {
      fromClause = Prisma.sql`${fromClause} join maison_mere_aap mma on candidacyOrganism.maison_mere_aap_id = mma.id`;
      fromClause = Prisma.sql`${fromClause} join account mmaAccount on mma.gestionnaire_account_id = mmaAccount.id`;
      whereClause = Prisma.sql`${whereClause} and mmaAccount.keycloak_id = ${IAMId}::uuid`;
    }
    //aap (manage_candidacy role) but not gestionnaire maison mère
    else {
      fromClause = Prisma.sql`${fromClause} join organism_on_account ooa on ooa.organism_id = candidacyOrganism.id`;
      fromClause = Prisma.sql`${fromClause} join account candidacyOrganismAccount on candidacyOrganismAccount.id = ooa.account_id`;
      whereClause = Prisma.sql`${whereClause} and candidacyOrganismAccount.keycloak_id = ${IAMId}::uuid`;
    }
  } else if (hasRole("admin") && maisonMereAAPId) {
    const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
      where: { id: maisonMereAAPId },
      select: {
        gestionnaire: {
          select: {
            keycloakId: true,
          },
        },
      },
    });

    if (maisonMereAAP?.gestionnaire.keycloakId) {
      fromClause = Prisma.sql`${fromClause} join maison_mere_aap mma on candidacyOrganism.maison_mere_aap_id = mma.id`;
      fromClause = Prisma.sql`${fromClause} join account mmaAccount on mma.gestionnaire_account_id = mmaAccount.id`;
      whereClause = Prisma.sql`${whereClause} and mmaAccount.keycloak_id = ${maisonMereAAP?.gestionnaire.keycloakId}::uuid`;
    }
  }

  //search filters
  if (searchFilter) {
    const words = searchFilter.split(/\s+/);

    const searchClauses = [];

    //search on organism
    searchClauses.push(
      getSearchFilterClause({
        table: "candidacyOrganism",
        fields: ["label"],
        words,
      }),
    );

    //search on candidate
    fromClause = Prisma.sql`${fromClause} join candidate on candidacy.candidate_id = candidate.id`;

    searchClauses.push(
      getSearchFilterClause({
        table: "candidate",
        fields: [
          "lastname",
          "given_name",
          "firstname",
          "firstname2",
          "firstname3",
          "email",
          "phone",
        ],
        words,
      }),
    );

    //search on department
    fromClause = Prisma.sql`${fromClause} left join department on candidate.department_id = department.id`;
    searchClauses.push(
      getSearchFilterClause({
        table: "department",
        fields: ["label"],
        words,
      }),
    );

    //search on certification
    fromClause = Prisma.sql`${fromClause} left join certification on candidacy.certification_id = certification.id`;
    searchClauses.push(
      getSearchFilterClause({
        table: "certification",
        fields: ["label", "rncp_type_diplome"],
        words,
      }),
    );

    whereClause = Prisma.sql` ${whereClause} and (${Prisma.join(searchClauses, " or ")})`;
  }

  const query = Prisma.sql`${selectClause} ${fromClause} ${whereClause}`;
  const [result] = (await prismaClient.$queryRaw(query)) as Array<object>;
  return result;
};

//get the sum clause for each status filter
const getSQLSelectSumClauseFromStatusFilter = (
  statusFilter: CandidacyStatusFilter,
) => {
  const getSumClause = (when: string) =>
    `coalesce(sum(case when (${when}) then 1 else 0 end),0)::INTEGER AS "${statusFilter}"`;

  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
    case "PRISE_EN_CHARGE_HORS_ABANDON":
    case "PARCOURS_ENVOYE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON":
    case "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON":
    case "VALIDATION_HORS_ABANDON":
    case "PROJET_HORS_ABANDON": {
      const status = getStatusFromStatusFilter(statusFilter);

      if (status !== null) {
        return getSumClause(
          `candidacy.status = '${status}' and candidacyDropOut.candidacy_id is null and candidacy.end_accompagnement_status not in ('CONFIRMED_BY_CANDIDATE', 'CONFIRMED_BY_ADMIN')`,
        );
      }
      break;
    }
    case "ACTIVE_HORS_ABANDON":
      return getSumClause(
        `candidacy.status not in ('ARCHIVE','PROJET','DOSSIER_FAISABILITE_NON_RECEVABLE')  and candidacyDropOut.candidacy_id is null and candidacy.end_accompagnement_status not in ('CONFIRMED_BY_CANDIDATE', 'CONFIRMED_BY_ADMIN')`,
      );
    case "ABANDON":
      return getSumClause(`candidacyDropOut.candidacy_id is not null`);

    case "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION":
      return getSumClause(
        `candidacy.status = 'ARCHIVE' and candidacyDropOut.candidacy_id is null and candidacy.reorientation_reason_id is null`,
      );
    case "REORIENTEE":
      return getSumClause(
        `candidacy.status = 'ARCHIVE' and candidacy.reorientation_reason_id is not null`,
      );

    case "JURY_HORS_ABANDON":
      return getSumClause(
        `candidacyDropOut.candidacy_id is null and activeJury.id is not null`,
      );

    case "JURY_PROGRAMME_HORS_ABANDON":
      return getSumClause(
        `candidacyDropOut.candidacy_id is null and activeJury.id is not null and activeJury.date_of_result is null`,
      );

    case "JURY_PASSE_HORS_ABANDON":
      return getSumClause(
        `candidacyDropOut.candidacy_id is null and activeJury.id is not null and activeJury.date_of_result is not null`,
      );
    case "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON":
      return getSumClause(
        `candidacy.status in ('DOSSIER_FAISABILITE_ENVOYE','DOSSIER_FAISABILITE_COMPLET') and candidacyDropOut.candidacy_id is null`,
      );
    case "VAE_COLLECTIVE":
      return getSumClause(
        `candidacy.cohorte_vae_collective_id is not null and candidacyDropOut.candidacy_id is null`,
      );
    case "DEMANDE_FINANCEMENT_ENVOYEE":
      return getSumClause(
        `(candidacy.finance_module = 'unireva' and fundingRequest.id is not null) or (candidacy.finance_module = 'unifvae' and fundingRequestUnifvae.id is not null)`,
      );
    case "DEMANDE_PAIEMENT_ENVOYEE":
      return getSumClause(
        `(candidacy.finance_module = 'unireva' and paymentRequest.confirmed_at is not null) or (candidacy.finance_module = 'unifvae' and paymentRequestUnifvae.confirmed_at is not null)`,
      );
    case "DEMANDE_PAIEMENT_A_ENVOYER":
      return getSumClause(
        `(candidacy.finance_module = 'unireva' and fundingRequest.id is not null and paymentRequest.confirmed_at is null) or (candidacy.finance_module = 'unifvae' and fundingRequestUnifvae.id is not null and paymentRequestUnifvae.confirmed_at is null)`,
      );
    case "END_ACCOMPAGNEMENT":
      return getSumClause(
        `candidacy.end_accompagnement_status in ('CONFIRMED_BY_CANDIDATE', 'CONFIRMED_BY_ADMIN')`,
      );
  }
};

//build a search clause for a table, a collection of fields and a collection of words
const getSearchFilterClause = ({
  table,
  fields,
  words,
}: {
  table: string;
  fields: string[];
  words: string[];
}) =>
  Prisma.join(
    words.map(
      (word) =>
        Prisma.sql`( ${getSearchFilterClauseForGivenWord({ table, fields, word })} )`,
    ),
    " and ",
  );

//build a search clause for a table, a collection of fields and a word
const getSearchFilterClauseForGivenWord = ({
  table,
  fields,
  word,
}: {
  table: string;
  fields: string[];
  word: string;
}) =>
  Prisma.join(
    fields.map((field) => {
      const tableAndField = Prisma.raw(`${table}.${field}`);
      const wordWithWildcards = `%${word}%`;
      return Prisma.sql`(${tableAndField} ilike ${wordWithWildcards})`;
    }),
    " or ",
  );
