import { faker } from "@faker-js/faker/.";
import { LegalStatus, MaisonMereAAP } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createAccountHelper } from "./create-account-helper";

export const createMaisonMereAapHelper = async (
  mmArgs?: Partial<MaisonMereAAP>,
) => {
  const account = await createAccountHelper();

  return prismaClient.maisonMereAAP.create({
    data: {
      raisonSociale: faker.company.name(),
      siret: faker.string.nanoid(14),
      statutJuridique: LegalStatus.ASSOCIATION_LOI_1901,
      typologie: "expertFiliere",
      dateExpirationCertificationQualiopi: faker.date.future(),
      gestionnaireAccountId: account.id,
      ...mmArgs,
    },
    include: {
      gestionnaire: true,
    },
  });
};
