import { prismaClient } from "../../../prisma/client";

type Formacode = {
  code: string;
  label: string;
  parentCode?: string;
};

let formacodes: Formacode[];

async function loadFormacodes() {
  const codes = await prismaClient.formacode.findMany();
  formacodes = codes.map((formacode) => ({
    code: formacode.code,
    label: formacode.label,
    parentCode: formacode.parentCode || undefined,
  }));
}

loadFormacodes();

export function getFormacodes(): Formacode[] {
  if (!formacodes) {
    throw new Error("formacodes has not been load");
  }

  return formacodes;
}
