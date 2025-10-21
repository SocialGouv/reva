import { FormacodeType } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export type Formacode = {
  id: string;
  code: string;
  label: string;
  type: FormacodeType;
  parentCode?: string;
};

export async function getFormacodes(params?: {
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

  const sortedFormacodes = formacodes.sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
  );

  return sortedFormacodes;
}

export async function getAvailableFormacodes(): Promise<Formacode[]> {
  const formacodes: Formacode[] = await getFormacodes();

  const certifications = await prismaClient.certification.findMany({
    where: {
      OR: [{ visible: true }, { status: "A_VALIDER_PAR_CERTIFICATEUR" }],
    },
    include: { certificationOnFormacode: true },
  });

  const availableFormacodes: { [key: string]: Formacode } = {};

  for (const certification of certifications) {
    const { certificationOnFormacode } = certification;

    for (const relation of certificationOnFormacode) {
      const subDomain = formacodes.find((f) => f.id == relation.formacodeId);

      if (subDomain) {
        availableFormacodes[subDomain.id] = subDomain;

        const domain =
          subDomain.parentCode &&
          formacodes.find((f) => f.code == subDomain.parentCode);

        if (domain) {
          availableFormacodes[domain.id] = domain;

          const mainDomain =
            domain.parentCode &&
            formacodes.find((f) => f.code == domain.parentCode);

          if (mainDomain) {
            availableFormacodes[mainDomain.id] = mainDomain;
          }
        }
      }
    }
  }

  const mappedFormacodes = Object.keys(availableFormacodes).map(
    (key) => availableFormacodes[key],
  );

  const sortedFormacodes = mappedFormacodes.sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
  );

  return sortedFormacodes;
}
