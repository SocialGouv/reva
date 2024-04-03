import { prismaClient } from "../../../prisma/client";

export const updateCandidacyCertificationCompletion = ({
  candidacyId,
  completion,
}: {
  candidacyId: string;
  completion: "COMPLETE" | "PARTIAL";
}) =>
  prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { isCertificationPartial: completion === "PARTIAL" },
  });
