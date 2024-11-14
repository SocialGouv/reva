import {
  Account,
  CandidacyStatusStep,
  Candidate,
  Department,
  MaisonMereAAP,
  Organism,
} from "@prisma/client";
import { prismaClient } from "../../prisma/client";
import {
  ACCOUNT_MAISON_MERE_A_METTRE_A_JOUR,
  ACCOUNT_MAISON_MERE_EXPERT_BRANCHE,
  ACCOUNT_MAISON_MERE_EXPERT_FILIERE,
  ACCOUNT_ORGANISM_EXPERT_BRANCHE,
  ACCOUNT_ORGANISM_EXPERT_FILIERE,
  BASIC_SKILL_1,
  BASIC_SKILL_2,
  CANDIDACY_UNIFVAE,
  CANDIDACY_UNIREVA,
  CANDIDATE_MAN,
  CANDIDATE_WOMAN,
  CERTIFICATION_AUTHORITY_STRUCTURES,
  FEASIBILITY_PDF_ADMISSIBLE,
  MAISON_MERE_AAP_A_METTRE_A_JOUR,
  MAISON_MERE_AAP_EXPERT_BRANCHE,
  MAISON_MERE_AAP_EXPERT_FILIERE,
  ORGANISM_EXPERT_BRANCHE,
  ORGANISM_EXPERT_FILIERE,
} from "../../test/fixtures";

export const createCandidateMan = async (): Promise<Candidate> => {
  const parisDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;

  return prismaClient.candidate.create({
    data: { ...CANDIDATE_MAN, departmentId: parisDepartment?.id },
  });
};

export const createCandidateWoman = async (): Promise<Candidate> => {
  const ileDeFranceDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;
  return prismaClient.candidate.create({
    data: { ...CANDIDATE_WOMAN, departmentId: ileDeFranceDepartment?.id },
  });
};

export const createMaisonMereAAPExpertBranche = async (): Promise<{
  maisonMereAAP: MaisonMereAAP;
  account: Account;
}> => {
  const account = await prismaClient.account.create({
    data: ACCOUNT_MAISON_MERE_EXPERT_BRANCHE,
  });

  const maisonMereAAP = await prismaClient.maisonMereAAP.create({
    data: {
      ...MAISON_MERE_AAP_EXPERT_BRANCHE,
      gestionnaireAccountId: account.id,
    },
  });

  return { maisonMereAAP, account };
};

export const createMaisonMereExpertFiliere = async (): Promise<{
  maisonMereAAP: MaisonMereAAP;
  account: Account;
}> => {
  const account = await prismaClient.account.create({
    data: ACCOUNT_MAISON_MERE_EXPERT_FILIERE,
  });

  const maisonMereAAP = await prismaClient.maisonMereAAP.create({
    data: {
      ...MAISON_MERE_AAP_EXPERT_FILIERE,
      gestionnaireAccountId: account.id,
    },
  });

  return { maisonMereAAP, account };
};

export const createMaisonMereAAPAMettreAJour = async (): Promise<{
  maisonMereAAP: MaisonMereAAP;
  account: Account;
}> => {
  const account = await prismaClient.account.create({
    data: ACCOUNT_MAISON_MERE_A_METTRE_A_JOUR,
  });

  const maisonMereAAP = await prismaClient.maisonMereAAP.create({
    data: {
      ...MAISON_MERE_AAP_A_METTRE_A_JOUR,
      gestionnaireAccountId: account.id,
    },
  });

  return { maisonMereAAP, account };
};

export const createExpertFiliereOrganism = async (): Promise<{
  organism: Organism;
  account: Account;
}> => {
  const organism = await prismaClient.organism.create({
    data: ORGANISM_EXPERT_FILIERE,
  });

  const account = await prismaClient.account.create({
    data: { ...ACCOUNT_ORGANISM_EXPERT_FILIERE, organismId: organism.id },
  });

  return { organism, account };
};

export const createExpertBrancheOrganism = async (): Promise<{
  organism: Organism;
  account: Account;
}> => {
  const organism = await prismaClient.organism.create({
    data: ORGANISM_EXPERT_BRANCHE,
  });

  const account = await prismaClient.account.create({
    data: { ...ACCOUNT_ORGANISM_EXPERT_BRANCHE, organismId: organism.id },
  });

  return { organism, account };
};

export const createCandidacyUnifvae = async () => {
  const mancheDepartment = (await prismaClient.department.findFirst({
    where: { code: "50" },
  })) as Department;

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
      ...CANDIDACY_UNIFVAE,
      departmentId: mancheDepartment?.id,
      basicSkills: {
        createMany: {
          data: [
            { basicSkillId: basicSkillId1 },
            { basicSkillId: basicSkillId2 },
          ],
        },
      },
      candidacyStatuses: {
        createMany: {
          data: [
            {
              isActive: false,
              status: CandidacyStatusStep.PROJET,
            },
            {
              isActive: false,
              status: CandidacyStatusStep.VALIDATION,
            },
            {
              isActive: false,
              status: CandidacyStatusStep.PRISE_EN_CHARGE,
            },
            {
              isActive: false,
              status: CandidacyStatusStep.PARCOURS_ENVOYE,
            },
            {
              isActive: true,
              status: CandidacyStatusStep.PARCOURS_CONFIRME,
            },
          ],
        },
      },
      Feasibility: {
        create: FEASIBILITY_PDF_ADMISSIBLE,
      },
    },
  });
};

export const createCandidacyUnireva = async () => {
  const mancheDepartment = (await prismaClient.department.findFirst({
    where: { code: "50" },
  })) as Department;

  return prismaClient.candidacy.create({
    data: {
      ...CANDIDACY_UNIREVA,
      departmentId: mancheDepartment?.id,
      candidacyStatuses: {
        createMany: {
          data: [
            {
              isActive: true,
              status: CandidacyStatusStep.PARCOURS_CONFIRME,
            },
          ],
        },
      },
    },
  });
};

export const createFeasibilityWithDematerializedFeasibilityFile = async (
  candidacyId: string,
) => {
  return prismaClient.feasibility.create({
    data: {
      certificationAuthority: {
        create: {
          label: "dummy",
          certificationAuthorityStructureId:
            CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
        },
      },
      dematerializedFeasibilityFile: {
        create: {},
      },
      candidacy: {
        connect: {
          id: candidacyId,
        },
      },
    },
    include: {
      dematerializedFeasibilityFile: true,
    },
  });
};
