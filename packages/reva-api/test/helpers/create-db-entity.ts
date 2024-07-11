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
} from "../fixtures/people-organisms";

import { prismaClient } from "../../prisma/client";
import {
  Account,
  Candidate,
  Organism,
  MaisonMereAAP,
  Department,
} from "@prisma/client";

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
        ...gestionaMaisonMereAapAccount1
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
        ...gestionaMaisonMereAapAccount2
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
      ...maisonMereAAP1,
      gestionnaireAccountId: gestionaMaisonMereAapAccount2.id,
    },
  });
};

export const createExpertFiliereOrganism = async (): Promise<Organism> => {
  return prismaClient.organism.create({
    data: expertFiliereOrganism,
  });
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
