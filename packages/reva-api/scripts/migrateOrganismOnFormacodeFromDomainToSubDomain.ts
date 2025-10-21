import { FormacodeType } from "@prisma/client";

import { prismaClient } from "../prisma/client";

type Formacode = {
  id: string;
  code: string;
  label: string;
  type: FormacodeType;
  parentCode?: string;
};

async function getFormacodes(params?: {
  version?: string;
}): Promise<Formacode[]> {
  const codes = await prismaClient.formacode.findMany({
    where: {
      version: params?.version || "v14",
    },
  });

  const formacodes: Formacode[] = codes.map((formacode) => ({
    id: formacode.id,
    code: formacode.code,
    label: formacode.label
      .toLowerCase()
      .replace(/^./, (str) => str.toUpperCase()),
    type: formacode.type,
    parentCode: formacode.parentCode || undefined,
  }));

  return formacodes;
}

const getChildren = (formacodes: Formacode[], parentCode: string) => {
  return formacodes.filter((formacode) => formacode.parentCode === parentCode);
};

const migrateOrganismOnFormacodeFromDomainToSubDomain = async () => {
  const formacodes = await getFormacodes({ version: "v14" });

  prismaClient.$transaction(async (tx) => {
    // Delete all organism on formacode where formacode version is v13
    await tx.organismOnFormacode.deleteMany({
      where: {
        formacode: {
          version: "v13",
        },
      },
    });

    // Update all organism on formacode from domain to sub domain
    const organismOnFormacodes = await tx.organismOnFormacode.findMany({
      include: {
        formacode: true,
      },
    });

    for (const organismOnFormacode of organismOnFormacodes) {
      const semanticField = organismOnFormacode.formacode;

      const domains = getChildren(formacodes, semanticField.code);

      for (const domain of domains) {
        const subDomains = getChildren(formacodes, domain.code);

        await tx.organismOnFormacode.createMany({
          data: subDomains.map((subDomain) => ({
            organismId: organismOnFormacode.organismId,
            formacodeId: subDomain.id,
          })),
        });
      }
    }

    await tx.organismOnFormacode.deleteMany({
      where: {
        id: {
          in: organismOnFormacodes.map(
            (organismOnFormacode) => organismOnFormacode.id,
          ),
        },
      },
    });

    // Update all formacode with new types

    // Update all domains to main domains
    await tx.formacode.updateMany({
      where: {
        type: "DOMAIN",
        version: "v14",
      },
      data: {
        type: "MAIN_DOMAIN",
      },
    });

    // Update all sub domains to semantic fields
    const semanticFields = formacodes.filter(
      (formacode) => formacode.type === "SUB_DOMAIN",
    );

    await tx.formacode.updateMany({
      where: {
        type: "SUB_DOMAIN",
        version: "v14",
      },
      data: {
        type: "SEMANTIC_FIELD",
      },
    });

    for (const semanticField of semanticFields) {
      const domains = getChildren(formacodes, semanticField.code);

      for (const domain of domains) {
        const subDomains = getChildren(formacodes, domain.code);

        await tx.formacode.updateMany({
          where: {
            id: { in: subDomains.map((subDomain) => subDomain.id) },
            version: "v14",
          },
          data: {
            type: "SUB_DOMAIN",
          },
        });

        await tx.formacode.update({
          where: {
            id: domain.id,
            version: "v14",
          },
          data: {
            type: "DOMAIN",
            parentCode: semanticField.parentCode,
          },
        });
      }
    }
  });
};

const main = async () => {
  await migrateOrganismOnFormacodeFromDomainToSubDomain();
};

main();
