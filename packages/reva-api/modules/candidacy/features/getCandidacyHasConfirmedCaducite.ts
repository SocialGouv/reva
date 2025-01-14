import { prismaClient } from "../../../prisma/client";

export const getCandidacyHasConfirmedCaducite = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacyContestations =
    await prismaClient.candidacyContestationCaducite.findFirst({
      where: {
        candidacyId,
        certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
      },
    });

  return !!candidacyContestations;
};
