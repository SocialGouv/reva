import { OrganismOnConventionCollective } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

import { createCCNHelper } from "./create-convention-collective-helper";
import { createOrganismHelper } from "./create-organism-helper";

export const createOrganismOnConventionCollectiveHelper = async (
  oOCCArgs?: Partial<OrganismOnConventionCollective>,
) => {
  const organism = await createOrganismHelper();
  const ccn = await createCCNHelper();

  return prismaClient.organismOnConventionCollective.create({
    data: {
      organismId: organism.id,
      ccnId: ccn.id,
      ...oOCCArgs,
    },
    include: {
      organism: true,
      ccn: true,
    },
  });
};
