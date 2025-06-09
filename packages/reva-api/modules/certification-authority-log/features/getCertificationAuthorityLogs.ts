import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityLogs = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  if (!certificationAuthorityId) {
    throw new Error("Identifiant de certification authority absent");
  }
  return prismaClient.certificationAuthorityLog.findMany({
    where: { certificationAuthorityId },
    orderBy: { createdAt: "desc" },
  });
};
