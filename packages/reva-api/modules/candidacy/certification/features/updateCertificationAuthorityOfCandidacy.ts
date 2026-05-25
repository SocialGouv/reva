import { prismaClient } from "@/prisma/client";

export const updateCertificationAuthorityOfCandidacy = ({
  candidacyId,
  certificationAuthorityId,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
}) =>
  prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { certificationAuthorityId },
  });
