import { FormacodeType } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export type Formacode = {
  id: string;
  code: string;
  label: string;
  type: FormacodeType;
  parentCode?: string;
};

export async function getFormacodes(): Promise<Formacode[]> {
  const codes = await prismaClient.formacode.findMany();

  const formacodes: Formacode[] = codes.map((formacode) => ({
    id: formacode.id,
    code: formacode.code,
    label: formacode.label,
    type: formacode.type,
    parentCode: formacode.parentCode || undefined,
  }));

  return formacodes;
}
