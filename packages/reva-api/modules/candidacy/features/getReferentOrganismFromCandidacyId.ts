import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";

export const getReferentOrganismFromCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  try {
    const candidacy = await prismaClient.candidacy.findUnique({
      where: { id: candidacyId },
      include: { organism: true },
    });

    if (!candidacy) {
      throw new Error(`Candidacy ${candidacyId} not found`);
    }

    return candidacy?.organism;
  } catch (e) {
    logger.error(e);
    throw Error(
      `Error while retreiving referent organism from candidacy ${candidacyId}: ${e}`
    );
  }
};
