import { prismaClient } from "@/prisma/client";

export const getCandidacyCertificationAuthorityLocalAccounts = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const accountsOnCandidacy =
    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.findMany({
      where: { candidacyId },
    });
  const accountIds = accountsOnCandidacy.map(
    (account) => account.certificationAuthorityLocalAccountId,
  );

  const localAccounts =
    await prismaClient.certificationAuthorityLocalAccount.findMany({
      where: {
        id: {
          in: accountIds,
        },
        contactFullName: {
          not: null,
        },
        contactEmail: {
          not: null,
        },
      },
    });
  return localAccounts;
};
