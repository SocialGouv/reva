import { prismaClient } from "../../../prisma/client";
import { getDepartmentsByCertificationAuthorityId } from "./getDepartmentsByCertificationAuthorityId";

export const getCertificationAuthorityRegions = async (
  certificationAuthorityId: string,
) => {
  const departments = await getDepartmentsByCertificationAuthorityId({
    certificationAuthorityId,
  });
  const regionIds = departments.map((d) => d.regionId);

  const regions = await prismaClient.region.findMany({
    where: { id: { in: regionIds } },
  });
  return regions;
};
