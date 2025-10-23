import { prismaClient } from "@/prisma/client";

export const loaders = {
  Account: {
    certificationAuthority: async (
      queries: { obj: { certificationAuthorityId?: string } }[],
    ) => {
      const certificationAuthorityIds: string[] = queries
        .map(({ obj }) => obj.certificationAuthorityId)
        .filter(
          (certificationAuthorityId) => !!certificationAuthorityId,
        ) as string[];

      const certificationAuthorities =
        await prismaClient.certificationAuthority.findMany({
          where: { id: { in: certificationAuthorityIds } },
        });

      return certificationAuthorityIds.map((cid) =>
        certificationAuthorities.find((c) => c.id === cid),
      );
    },
  },
};
