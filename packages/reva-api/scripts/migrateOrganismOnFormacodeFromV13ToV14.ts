import { getFormacodes } from "@/modules/referential/features/getFormacodes";

import { prismaClient } from "../prisma/client";

const migrateOrganismOnFormacodeFromV13ToV14 = async () => {
  const formacodes = await getFormacodes({ version: "v14" });

  const organismOnFormacodes = await prismaClient.organismOnFormacode.findMany({
    include: {
      formacode: true,
    },
  });

  for (const organismOnFormacode of organismOnFormacodes) {
    try {
      const formacode = formacodes.find(
        (formacode) => formacode.code === organismOnFormacode.formacode.code,
      );

      if (!formacode) {
        console.log(
          `Formacode ${organismOnFormacode.formacode.code} not found`,
        );
        continue;
      }

      await prismaClient.organismOnFormacode.update({
        where: { id: organismOnFormacode.id },
        data: { formacodeId: formacode.id },
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const main = async () => {
  await migrateOrganismOnFormacodeFromV13ToV14();
};

main();
