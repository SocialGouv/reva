import { faker } from "@faker-js/faker";
import { OrganismTypology, Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createAccountHelper } from "./create-account-helper";
import { createMaisonMereAapHelper } from "./create-maison-mere-aap-helper";

export const createOrganismHelper = async (
  organismArgs?: Partial<Prisma.OrganismUncheckedCreateInput>,
) => {
  const maisonMere = await createMaisonMereAapHelper({
    typologie: organismArgs?.typology ?? OrganismTypology.expertFiliere,
  });
  const account = await createAccountHelper();

  return prismaClient.organism.create({
    data: {
      contactAdministrativeEmail: faker.internet.email(),
      label: faker.company.name(),
      siret: faker.string.numeric({ length: 14 }),
      typology: OrganismTypology.expertBranche,
      modaliteAccompagnement: "A_DISTANCE",
      modaliteAccompagnementRenseigneeEtValide: true,
      maisonMereAAPId: maisonMere.id,
      adresseCodePostal: faker.location.zipCode(),
      adresseInformationsComplementaires: faker.location.streetAddress(),
      adresseNumeroEtNomDeRue: faker.location.streetAddress(),
      adresseVille: faker.location.city(),
      conformeNormesAccessibilite: "CONFORME",
      emailContact: faker.internet.email(),
      nomPublic: faker.person.fullName(),
      siteInternet: faker.internet.url(),
      telephone: faker.phone.number(),
      accounts: {
        connect: {
          id: account.id,
        },
      },
      organismOnAccounts: {
        create: {
          accountId: account.id,
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
