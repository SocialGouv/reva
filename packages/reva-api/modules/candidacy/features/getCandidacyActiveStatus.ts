import { prismaClient } from "../../../prisma/client";

export const getCandidacyActiveStatus = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidaciesStatus.findFirstOrThrow({
    where: { candidacyId, isActive: true },
  });
