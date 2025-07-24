import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

type CandidacyInclude = Prisma.CandidacyInclude | undefined;
type CandidacyReturnType<T extends CandidacyInclude> =
  Promise<Prisma.CandidacyGetPayload<{ include: T }> | null>;

export const getCandidacyById = async function getCandidacyById<
  SelectedIncludes extends CandidacyInclude,
>({
  candidacyId,
  includes = {} as SelectedIncludes,
  tx,
}: {
  candidacyId: string;
  includes?: SelectedIncludes;
  tx?: Prisma.TransactionClient; //optional transaction to use
}): CandidacyReturnType<SelectedIncludes> {
  const candidacy = await (tx || prismaClient).candidacy.findUnique({
    where: { id: candidacyId },
    include: includes,
  });
  return candidacy as Awaited<CandidacyReturnType<SelectedIncludes>>;
};
