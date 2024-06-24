import { getCandidacyById } from "./getCandidacyById";
import { getReorientationReasonById } from "../../referential/features/getReorientationReasonById";
import { prismaClient } from "../../../prisma/client";
import { candidacyIncludes } from "../database/candidacies";
import { toDomainExperiences } from "../database/experiences";
import { logger } from "../../shared/logger";

interface ArchiveCandidacyParams {
  candidacyId: string;
  reorientationReasonId: string | null;
}
export const archiveCandidacy = async (params: ArchiveCandidacyParams) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
        candidacyStatuses: true,
      },
    });
  } catch (error) {
    throw new Error(
      `La candidature ${params.candidacyId} n'a pas pu être récupérée: ${error}`,
    );
  }

  if (!candidacy) {
    throw new Error(`La candidature ${params.candidacyId} n'existe pas`);
  }

  const isArchived = Boolean(
    candidacy?.candidacyStatuses.find(
      (status) => status.status === "ARCHIVE" && status.isActive,
    ),
  );

  if (isArchived) {
    throw new Error("La candidature est déjà archivée");
  }

  if (params.reorientationReasonId) {
    const r = await getReorientationReasonById({
      reorientationReasonId: params.reorientationReasonId || "",
    });
    if (!r) {
      throw new Error("La raison de réorientation n'est pas valide");
    }
  }

  try {
    const [, newCandidacy, certificationAndRegion] =
      await prismaClient.$transaction([
        prismaClient.candidaciesStatus.updateMany({
          where: {
            candidacyId: params.candidacyId,
          },
          data: {
            isActive: false,
          },
        }),
        prismaClient.candidacy.update({
          where: {
            id: params.candidacyId,
          },
          data: {
            candidacyStatuses: {
              create: {
                status: "ARCHIVE",
                isActive: true,
              },
            },
            reorientationReasonId: params.reorientationReasonId,
          },
          include: {
            ...candidacyIncludes,
            candidate: true,
          },
        }),
        prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
          where: {
            candidacyId: params.candidacyId,
            isActive: true,
          },
          include: {
            certification: true,
            region: true,
          },
        }),
      ]);

    return {
      id: newCandidacy.id,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certificationId,
      certification: {
        ...certificationAndRegion?.certification,
        codeRncp: certificationAndRegion?.certification.rncpId,
      },
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
      financeModule: newCandidacy.financeModule,
    };
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de l'archivage de la candidature ${params.candidacyId}`,
    );
  }
};
