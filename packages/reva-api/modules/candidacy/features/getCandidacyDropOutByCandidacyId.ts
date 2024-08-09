import { prismaClient } from "../../../prisma/client";

export const getCandidacyDropOutByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  candidacyId
    ? prismaClient.candidacyDropOut.findUnique({ where: { candidacyId } })
    : null;
