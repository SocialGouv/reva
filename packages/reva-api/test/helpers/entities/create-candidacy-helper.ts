import {
  Candidacy,
  CandidacyStatusStep,
  CandidateTypology,
  FinanceModule,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { BASIC_SKILL_1, BASIC_SKILL_2 } from "../../../test/fixtures";
import { createCandidateHelper } from "./create-candidate-helper";
import { createCertificationHelper } from "./create-certification-helper";
import { createOrganismHelper } from "./create-organism-helper";

export const createCandidacyHelper = async (args?: {
  candidacyArgs?: Partial<Candidacy>;
  candidacyActiveStatus?: CandidacyStatusStep;
}) => {
  const { candidacyArgs, candidacyActiveStatus } = args ?? {};

  const certification = await createCertificationHelper();
  const department = await prismaClient.department.findFirst({
    where: { code: "75" },
  });
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
      departmentId: department?.id ?? "",
      basicSkills: {
        createMany: {
          data: [
            { basicSkillId: basicSkillId1 },
            { basicSkillId: basicSkillId2 },
          ],
        },
      },
      certificationId: certification.id,
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: {
          status:
            candidacyActiveStatus ?? CandidacyStatusStep.PARCOURS_CONFIRME,
          isActive: true,
        },
      },
      ...candidacyArgs,
    },
    include: {
      certification: {
        include: {
          certificationAuthorityStructure: {
            include: {
              oldCertificationAuthorities: { include: { Account: true } },
              certificationRegistryManager: { include: { account: true } },
            },
          },
        },
      },
      organism: { include: { accounts: true } },
      candidate: true,
      candidacyDropOut: true,
      candidacyStatuses: true,
      department: true,
    },
  });
};
