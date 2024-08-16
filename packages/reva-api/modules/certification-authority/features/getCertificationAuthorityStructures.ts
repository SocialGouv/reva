import { CertificationAuthorityStructure } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

export const getCertificationAuthorityStructures = async ({
  limit = 10,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedListResult<CertificationAuthorityStructure>> => {
  const certificationAuthorityStructure =
    await prismaClient.certificationAuthorityStructure.findMany({
      orderBy: [{ label: "asc" }],
      take: limit,
      skip: offset,
    });

  const count = await prismaClient.certificationAuthorityStructure.count();

  return {
    rows: certificationAuthorityStructure,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit,
      offset,
    }),
  };
};
