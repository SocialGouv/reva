import { prismaClient } from "../../../prisma/client";

type Formacode = {
  code: string;
  label: string;
  parentCode?: string;
};

export async function getFormacodes(): Promise<Formacode[]> {
  const codes = await prismaClient.formacode.findMany();

  const formacodes: Formacode[] = codes.map((formacode) => ({
    code: formacode.code,
    label: formacode.label,
    parentCode: formacode.parentCode || undefined,
  }));

  return formacodes;
}
