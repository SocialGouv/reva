import {
  Candidacy,
  CandidacyStatusStep,
  CandidateTypology,
  FinanceModule,
} from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import {
  BASIC_SKILL_1,
  BASIC_SKILL_2,
} from "@/test/fixtures/basic-skills.fixtures";

import { createCandidateHelper } from "./create-candidate-helper";
import { createCertificationHelper } from "./create-certification-helper";
import { createOrganismHelper } from "./create-organism-helper";

export const createCandidacyHelper = async (args?: {
  candidacyArgs?: Partial<Candidacy>;
  candidacyActiveStatus?: CandidacyStatusStep;
  certificationId?: string;
}) => {
  const { candidacyArgs, candidacyActiveStatus, certificationId } = args ?? {};

  const certification = await createCertificationHelper();
  const candidate = await createCandidateHelper();

  const organism = candidacyArgs?.organismId
    ? await prismaClient.organism.findUnique({
        where: { id: candidacyArgs?.organismId },
      })
    : await createOrganismHelper();

  if (!organism) {
    throw Error("Organism not found");
  }

  const basicSkillId1 = (
    await prismaClient.basicSkill.findFirstOrThrow({
      where: {
        label: BASIC_SKILL_1,
      },
    })
  ).id;

  const basicSkillId2 = (
    await prismaClient.basicSkill.findFirstOrThrow({
      where: {
        label: BASIC_SKILL_2,
      },
    })
  ).id;

  return prismaClient.candidacy.create({
    data: {
      typology: CandidateTypology.BENEVOLE,
      financeModule: FinanceModule.unifvae,
      isCertificationPartial: false,
      status: candidacyActiveStatus ?? CandidacyStatusStep.PARCOURS_CONFIRME,
      basicSkills: {
        createMany: {
          data: [
            { basicSkillId: basicSkillId1 },
            { basicSkillId: basicSkillId2 },
          ],
        },
      },
      certificationId: certificationId ?? certification.id,
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: {
          status:
            candidacyActiveStatus ?? CandidacyStatusStep.PARCOURS_CONFIRME,
        },
      },
      ...candidacyArgs,
    },
    include: {
      certification: {
        include: {
          certificationAuthorityStructure: {
            include: {
              certificationAuthorityOnCertificationAuthorityStructure: {
                include: {
                  certificationAuthority: { include: { Account: true } },
                },
              },
              certificationRegistryManager: { include: { account: true } },
            },
          },
        },
      },
      organism: {
        include: {
          organismOnAccounts: {
            include: {
              account: true,
            },
          },
        },
      },
      candidate: true,
      candidacyDropOut: true,
      candidacyStatuses: true,
    },
  });
};
