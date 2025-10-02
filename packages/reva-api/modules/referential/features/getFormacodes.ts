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

  return formacodes;
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
      const formacode = formacodes.find((f) => f.id == relation.formacodeId);

      if (formacode) {
        availableFormacodes[formacode.id] = formacode;

        const parent =
          formacode.parentCode &&
          formacodes.find((f) => f.code == formacode.parentCode);

        if (parent) {
          availableFormacodes[parent.id] = parent;
        }
      }
    }
  }

  const mappedFormacodes = Object.keys(availableFormacodes).map(
    (key) => availableFormacodes[key],
  );

  return mappedFormacodes;
}
