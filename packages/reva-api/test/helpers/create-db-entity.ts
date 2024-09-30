import {
  adminAccount1,
  gestionaMaisonMereAapAccount1,
  gestionaMaisonMereAapAccount2,
  archiIperia1,
  archiIperia2,
  candidateJPL,
  candidateMPB,
  expertBrancheEtFiliereOrganism,
  expertBrancheOrganism,
  expertFiliereOrganism,
  organismIperia,
  maisonMereAAP1,
  maisonMereAAP2,
  agencePrincipaleMaisonMere2,
  lieuAccueilMaisonMere2,
  collaborateurMaisonMereAapAccount2,
} from "../fixtures/people-organisms";

import { prismaClient } from "../../prisma/client";
import {
  Account,
  Candidate,
  Organism,
  MaisonMereAAP,
  Department,
  CandidacyStatusStep,
} from "@prisma/client";
import {
  basicSkill1Label,
  basicSkill2Label,
  training1Label,
} from "../fixtures/skillAndTraining";
import { feasibilityAdmissible } from "../fixtures/feasibility";
import { candidacyUnifvae, candidacyUnireva } from "../fixtures/candidacy";
import { fundingRequestSample } from "../fixtures/funding-request";

export const createAdminAccount1 = async (): Promise<Account> => {
  return prismaClient.account.create({
    data: adminAccount1,
  });
};

export const createGestionaMaisonMereAapAccount1 =
  async (): Promise<Account> => {
    return prismaClient.account.upsert({
      where: {
        id: gestionaMaisonMereAapAccount1.id,
      },
      update: {},
      create: {
        ...gestionaMaisonMereAapAccount1,
      },
    });
  };

export const createGestionaMaisonMereAapAccount2 =
  async (): Promise<Account> => {
    return prismaClient.account.upsert({
      where: {
        id: gestionaMaisonMereAapAccount2.id,
      },
      update: {},
      create: {
        ...gestionaMaisonMereAapAccount2,
      },
    });
  };

export const createArchitectIperia1 = async (): Promise<Account> => {
  return prismaClient.account.create({
    data: archiIperia1,
  });
};

export const createArchitectIperia2 = async (): Promise<Account> => {
  return prismaClient.account.create({
    data: archiIperia2,
  });
};

export const createCandidateJPL = async (): Promise<Candidate> => {
  const parisDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;

  return prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: parisDepartment?.id },
  });
};

export const createCandidateMPB = async (): Promise<Candidate> => {
  const parisDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;
  return prismaClient.candidate.create({
    data: {
      ...candidateMPB,
      departmentId: parisDepartment?.id,
    },
  });
};

export const createOrganismIperia = async (): Promise<Organism> => {
  return prismaClient.organism.create({
    data: organismIperia,
  });
};

export const createMaisonMereAAP1 = async (): Promise<MaisonMereAAP> => {
  return prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP1,
      gestionnaireAccountId: gestionaMaisonMereAapAccount1.id,
    },
  });
};

export const createMaisonMereAAP2 = async (): Promise<MaisonMereAAP> => {
  return prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP2,
      gestionnaireAccountId: gestionaMaisonMereAapAccount2.id,
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
    data: expertFiliereOrganism,
  });

  await prismaClient.account.create({
    data: {
      ...gestionaMaisonMereAapAccount1,
      organismId: expertFiliereOrganism.id,
    },
  });

  return organism;
};

export const createExpertBrancheOrganism = async (): Promise<Organism> => {
  return prismaClient.organism.create({
    data: expertBrancheOrganism,
  });
};

export const createExpertBrancheEtFiliereOrganism =
  async (): Promise<Organism> => {
    return prismaClient.organism.create({
      data: expertBrancheEtFiliereOrganism,
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
      ...candidacyUnifvae,
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
      ...candidacyUnireva,
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

export const createFundingRequest = async () => {
  const basicSkillId1 = (
    await prismaClient.basicSkill.findFirstOrThrow({
      where: {
        label: basicSkill1Label,
      },
    })
  ).id;

  const trainingId1 = (
    await prismaClient.training.findFirstOrThrow({
      where: {
        label: training1Label,
      },
    })
  ).id;

  return prismaClient.fundingRequestUnifvae.create({
    data: {
      ...fundingRequestSample,
      candidacyId: candidacyUnifvae.id,
      certificateSkills: "",
      otherTraining: "",
      basicSkills: {
        createMany: { data: [{ basicSkillId: basicSkillId1 }] },
      },
      mandatoryTrainings: {
        createMany: { data: [{ trainingId: trainingId1 }] },
      },
    },
  });
};
