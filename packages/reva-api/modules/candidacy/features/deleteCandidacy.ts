import { FunctionalCodeError } from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger";
import { prismaClient } from "@/prisma/client";

export const deleteCandidacy = async ({candidacyId}: {candidacyId: string}) => {
    try {
      await prismaClient.$transaction(async (tx) => {
        // Delete related records first (child records)
        await tx.admissibility.deleteMany({ where: { candidacyId } });
        await tx.examInfo.deleteMany({ where: { candidacyId } });
        await tx.candidacyLog.deleteMany({ where: { candidacyId } });
        await tx.candidacyDropOut.deleteMany({ where: { candidacyId } });

        // Delete the main candidacy record last (parent record)
        await tx.candidacy.delete({ where: { id: candidacyId } });
      });
    } catch (error) {
      logger.error(error);
      throw new Error(
        `${FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST} La candidature ${candidacyId} n'a pas pu être supprimée: ${error}`,
      );
    }
};
