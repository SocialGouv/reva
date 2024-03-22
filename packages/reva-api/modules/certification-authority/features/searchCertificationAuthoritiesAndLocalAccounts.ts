import { Prisma } from "@prisma/client";
import { CertificationAuthorityOrLocalAccount } from "../certification-authority.types";
import { processPaginationInfo } from "../../shared/list/pagination";
import { prismaClient } from "../../../prisma/client";

export const searchCertificationAuthoritiesAndLocalAccounts = async ({
  limit = 10,
  offset = 0,
  searchFilter = "",
}: {
  limit?: number;
  offset?: number;
  searchFilter?: string;
}): Promise<PaginatedListResult<CertificationAuthorityOrLocalAccount>> => {
  const querySearchFilter = `%${searchFilter}%`;
  const certificationAuthorityBaseQuery = Prisma.sql`select id, label,contact_email as "email",  'CERTIFICATION_AUTHORITY' as "type" from certification_authority where label ilike ${querySearchFilter}`;

  const certificationAuthorityLocalAccountBaseQuery = Prisma.sql`select certification_authority_local_account.id,certification_authority.label, account.email as "email", 'CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT'as "type" from certification_authority_local_account join account on account.id = certification_authority_local_account.account_id join certification_authority on certification_authority.id=certification_authority_local_account.certification_authority_id where certification_authority.label ilike ${querySearchFilter}`;

  const baseQuery = Prisma.sql`(${certificationAuthorityBaseQuery} union ${certificationAuthorityLocalAccountBaseQuery}) order by label,type limit ${limit} offset ${offset}`;

  const baseCountQuery = Prisma.sql`
  select (select count(id) from certification_authority where label ilike ${querySearchFilter})+(select count(certification_authority_local_account.id) from certification_authority_local_account join certification_authority on certification_authority.id=certification_authority_local_account.certification_authority_id where certification_authority.label ilike ${querySearchFilter}) as "total"`;

  const results = (await prismaClient.$queryRaw(
    baseQuery,
  )) as CertificationAuthorityOrLocalAccount[];

  const totalRows = Number(
    (
      (await prismaClient.$queryRaw(baseCountQuery)) as {
        total: bigint;
      }[]
    )[0].total,
  );

  return {
    rows: results,
    info: processPaginationInfo({
      totalRows,
      limit: limit,
      offset,
    }),
  };
};
