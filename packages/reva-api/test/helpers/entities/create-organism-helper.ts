import { faker } from "@faker-js/faker/.";
import { Organism, OrganismTypology } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createAccountHelper } from "./create-account-helper";
import { createMaisonMereAapHelper } from "./create-maison-mere-aap-helper";

export const createOrganismHelper = async (
  organismArgs?: Partial<Organism>,
) => {
  const maisonMere = await createMaisonMereAapHelper({
    typologie: organismArgs?.typology ?? OrganismTypology.expertFiliere,
  });
  const account = await createAccountHelper();

  return prismaClient.organism.create({
    data: {
      contactAdministrativeEmail: faker.internet.email(),
      label: faker.company.name(),
      siret: faker.string.nanoid(14),
      typology: OrganismTypology.expertBranche,
      modaliteAccompagnement: "A_DISTANCE",
      modaliteAccompagnementRenseigneeEtValide: true,
      maisonMereAAPId: maisonMere.id,
      accounts: {
        connect: {
          id: account.id,
        },
      },
      ...organismArgs,
    },
    include: {
      accounts: true,
      maisonMereAAP: {
        include: {
          gestionnaire: true,
        },
      },
    },
  });
};
