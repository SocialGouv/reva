import {
  MaisonMereAAP,
  Prisma,
  type StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

export const getMaisonMereAAPs = async ({
  limit = 10,
  offset = 0,
  searchFilter,
  legalValidationStatus,
}: {
  limit?: number;
  offset?: number;
  searchFilter?: string;
  legalValidationStatus?: StatutValidationInformationsJuridiquesMaisonMereAAP;
}): Promise<PaginatedListResult<MaisonMereAAP>> => {
  const whereClauses: string[] = [];
  const whereParams: any[] = [];

  if (legalValidationStatus) {
    whereParams.push(legalValidationStatus);
    whereClauses.push(
      `maison_mere_aap.statut_validation_informations_juridiques_maison_mere_aap = $${whereParams.length}`,
    );
  }

  if (searchFilter) {
    const words = searchFilter.trim().split(/\s+/);
    words.forEach((word) => {
      const conditions: string[] = [];
      const paramValue = `%${word}%`;

      const fields = {
        maison_mere_aap: ["raison_sociale", "siret"],
        account: ["firstname", "lastname", "email"],
        maison_mere_aap_legal_information_documents: [
          "manager_firstname",
          "manager_lastname",
        ],
        organism: ["contact_administrative_email"],
        // TODO:
        //organism > account: ["firstname", "lastname", "email"],
      };

      for (const [table, columns] of Object.entries(fields)) {
        columns.forEach((column) => {
          whereParams.push(paramValue);
          conditions.push(
            `unaccent(${table}."${column}") ILIKE unaccent($${whereParams.length})`,
          );
        });
      }

      whereClauses.push(`(${conditions.join(" OR ")})`);
    });
  }

  const whereClause =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  let orderByClause = "";
  if (legalValidationStatus === "EN_ATTENTE_DE_VERIFICATION") {
    orderByClause =
      "ORDER BY maison_mere_aap_legal_information_documents.created_at DESC, maison_mere_aap.raison_sociale ASC";
  } else {
    orderByClause =
      "ORDER BY maison_mere_aap.created_at DESC, maison_mere_aap.raison_sociale ASC";
  }

  const mainQueryParams = [...whereParams, limit, offset];
  const limitParamIndex = whereParams.length + 1;
  const offsetParamIndex = whereParams.length + 2;

  // TODO LEFT JOIN account > organism
  const sql = Prisma.sql`
      SELECT maison_mere_aap.*
      FROM maison_mere_aap
               LEFT JOIN account ON maison_mere_aap.gestionnaire_account_id = account.id
               LEFT JOIN maison_mere_aap_legal_information_documents
                         ON maison_mere_aap_legal_information_documents.maison_mere_aap_id = maison_mere_aap.id
               LEFT JOIN organism ON organism."maison_mere_aap_id" = maison_mere_aap.id ON account.organism_id = organism.id ${whereClause}
          ${orderByClause}
      LIMIT $${limitParamIndex}
    OFFSET $${offsetParamIndex}
  `;

  const maisonMereAAPs = await prismaClient.$queryRaw<MaisonMereAAP[]>(
    sql,
    ...mainQueryParams,
  );

  // TODO LEFT JOIN account > organism
  const countSql = Prisma.sql`
      SELECT COUNT(DISTINCT maison_mere_aap.id) as total_count
      FROM maison_mere_aap
               LEFT JOIN account ON maison_mere_aap.gestionnaire_account_id = account.id
               LEFT JOIN maison_mere_aap_legal_information_documents
                         ON maison_mere_aap_legal_information_documents.maison_mere_aap_id = maison_mere_aap.id
               LEFT JOIN organism ON organism.maison_mere_aap_id = maison_mere_aap.id
          ${whereClause}
  `;

  const countResult = await prismaClient.$queryRaw<{ total_count: number }[]>(
    countSql,
    ...whereParams,
  );
  const count = countResult[0]?.total_count ?? 0;

  return {
    rows: maisonMereAAPs,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit,
      offset,
    }),
  };
};
