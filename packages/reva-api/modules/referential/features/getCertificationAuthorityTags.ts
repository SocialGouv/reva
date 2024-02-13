import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityTags = async () =>
  (
    await prismaClient.certification.findMany({
      where: { certificationAuthorityTag: { not: null } },
      select: { certificationAuthorityTag: true },
      distinct: ["certificationAuthorityTag"],
      orderBy: { certificationAuthorityTag: "asc" },
    })
  ).map((c) => c.certificationAuthorityTag);
