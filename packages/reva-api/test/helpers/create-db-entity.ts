import {
  agencePrincipaleMaisonMere2,
  collaborateurMaisonMereAapAccount2,
  gestionnaireMaisonMereAAP1,
  gestionnaireMaisonMereAAP2,
  lieuAccueilMaisonMere2,
  maisonMereAAP1,
  maisonMereAAP2,
  maisonMereAAPExpertBranche,
  maisonMereAAPExpertFiliere,
} from "../fixtures/people-organisms";

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
  CANDIDACY_UNIFVAE,
  CANDIDACY_UNIREVA,
  CANDIDATE_MAN,
  EXPERT_BRANCHE_ORGANISM,
  EXPERT_FILIERE_ORGANISM,
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
        id: gestionnaireMaisonMereAAP1.id,
      },
      update: {},
      create: {
        ...gestionnaireMaisonMereAAP1,
      },
    });
  };

export const createGestionnaireMaisonMereAapAccount2 =
  async (): Promise<Account> => {
    return prismaClient.account.upsert({
      where: {
        id: gestionnaireMaisonMereAAP2.id,
      },
      update: {},
      create: {
        ...gestionnaireMaisonMereAAP2,
      },
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
        ...maisonMereAAPExpertFiliere,
        gestionnaireAccountId: gestionnaireMaisonMereAAP1.id,
      },
    });
  };

export const createMaisonMereAAPExpertBranche =
  async (): Promise<MaisonMereAAP> => {
    return prismaClient.maisonMereAAP.create({
      data: {
        ...maisonMereAAPExpertBranche,
        gestionnaireAccountId: gestionnaireMaisonMereAAP2.id,
      },
    });
  };

export const createMaisonMereAAP1 = async (): Promise<MaisonMereAAP> => {
  return prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP1,
      gestionnaireAccountId: gestionnaireMaisonMereAAP1.id,
    },
  });
};

export const createMaisonMereAAP2 = async (): Promise<MaisonMereAAP> => {
  return prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP2,
      gestionnaireAccountId: gestionnaireMaisonMereAAP2.id,
    },
  });
};

export const createCollaborateurMaisonMereAAP2 = async (): Promise<Account> => {
  return prismaClient.account.create({
    data: {
      ...collaborateurMaisonMereAapAccount2,
      organismId: lieuAccueilMaisonMere2.id,
    },
  });
};

export const createAgencePrincipaleMaisonMere2 =
  async (): Promise<Organism> => {
    return prismaClient.organism.create({
      data: agencePrincipaleMaisonMere2,
    });
  };

export const createLieuAccueilMaisonMere2 = async (): Promise<Organism> => {
  return prismaClient.organism.create({
    data: lieuAccueilMaisonMere2,
  });
};

export const createExpertFiliereOrganism = async (): Promise<Organism> => {
  const organism = await prismaClient.organism.create({
    data: EXPERT_FILIERE_ORGANISM,
  });

  await prismaClient.account.create({
    data: {
      ...gestionnaireMaisonMereAAP1,
      organismId: EXPERT_FILIERE_ORGANISM.id,
    },
  });

  return organism;
};

export const createExpertBrancheOrganism = async (): Promise<Organism> => {
  return prismaClient.organism.create({
    data: EXPERT_BRANCHE_ORGANISM,
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
