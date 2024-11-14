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
  ACCOUNT_2,
  ACCOUNT_3,
  ACCOUNT_MAISON_MERE_EXPERT_FILIERE,
  ACCOUNT_ORGANISM_EXPERT_FILIERE,
  CANDIDACY_UNIFVAE,
  CANDIDACY_UNIREVA,
  CANDIDATE_MAN,
  MAISON_MERE_AAP_A_METTRE_A_JOUR,
  MAISON_MERE_AAP_EXPERT_BRANCHE,
  MAISON_MERE_AAP_EXPERT_FILIERE,
  ORGANISM_EXPERT_BRANCHE,
  ORGANISM_EXPERT_FILIERE,
} from "../../test/fixtures";
import { certificationAuthorityStructureFixtures } from "../../test/fixtures/certification";
import { feasibilityAdmissible } from "../fixtures/feasibility";
import {
  basicSkill1Label,
  basicSkill2Label,
} from "../fixtures/skillAndTraining";

export const createGestionnaireMaisonMereAapAccount1 =
  async (): Promise<Account> => {
    return prismaClient.account.upsert({
      where: {
        id: ACCOUNT_MAISON_MERE_EXPERT_FILIERE.id,
      },
      update: {},
      create: {
        ...ACCOUNT_MAISON_MERE_EXPERT_FILIERE,
      },
    });
  };

export const createGestionnaireMaisonMereAapAccount2 =
  async (): Promise<Account> => {
    return prismaClient.account.upsert({
      where: {
        id: ACCOUNT_2.id,
      },
      update: {},
      create: {
        ...ACCOUNT_2,
      },
    });
  };

export const createGestionnaireMaisonMereAapAccount3 =
  async (): Promise<Account> => {
    return prismaClient.account.upsert({
      where: { id: ACCOUNT_3.id },
      update: {},
      create: { ...ACCOUNT_3 },
    });
  };

export const createCandidateJPL = async (): Promise<Candidate> => {
  const parisDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;

  return prismaClient.candidate.create({
    data: { ...CANDIDATE_MAN, departmentId: parisDepartment?.id },
  });
};

export const createMaisonMereAAPExpertFiliere =
  async (): Promise<MaisonMereAAP> => {
    return prismaClient.maisonMereAAP.create({
      data: {
        ...MAISON_MERE_AAP_EXPERT_FILIERE,
        gestionnaireAccountId: ACCOUNT_MAISON_MERE_EXPERT_FILIERE.id,
      },
    });
  };

export const createMaisonMereAAPExpertBranche =
  async (): Promise<MaisonMereAAP> => {
    return prismaClient.maisonMereAAP.create({
      data: {
        ...MAISON_MERE_AAP_EXPERT_BRANCHE,
        gestionnaireAccountId: ACCOUNT_2.id,
      },
    });
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

export const createMaisonMereAAP2 = async (): Promise<MaisonMereAAP> => {
  return prismaClient.maisonMereAAP.create({
    data: {
      ...MAISON_MERE_AAP_A_METTRE_A_JOUR,
      gestionnaireAccountId: ACCOUNT_2.id,
    },
  });
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

export const createExpertBrancheOrganism = async (): Promise<Organism> => {
  return prismaClient.organism.create({
    data: ORGANISM_EXPERT_BRANCHE,
  });
};

export const createCandidacyUnifvae = async () => {
  const mancheDepartment = (await prismaClient.department.findFirst({
    where: { code: "50" },
  })) as Department;

  const basicSkillId1 = (
    await prismaClient.basicSkill.findFirstOrThrow({
      where: {
        label: basicSkill1Label,
      },
    })
  ).id;

  const basicSkillId2 = (
    await prismaClient.basicSkill.findFirstOrThrow({
      where: {
        label: basicSkill2Label,
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
        create: feasibilityAdmissible,
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
            certificationAuthorityStructureFixtures.UIMM.id,
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
