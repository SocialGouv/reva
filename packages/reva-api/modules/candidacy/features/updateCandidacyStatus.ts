import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import * as domain from "../candidacy.types";
import { candidacyIncludes } from "../database/candidacies";
import { toDomainExperiences } from "../database/experiences";

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}): Promise<Error | domain.Candidacy> => {
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
                status: params.status,
                isActive: true,
              },
            },
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
      deviceId: newCandidacy.deviceId,
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
      goals: newCandidacy.goals,
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    } as domain.Candidacy;
  } catch (e) {
    logger.error(e);
    return Error(
      `error while updating status on candidacy ${params.candidacyId}`
    );
  }
};
