import { prismaClient } from "../../prisma/client";

export const loaders = {
  Account: {
    organism: async (queries: { obj: { organismId?: string } }[]) => {
      const organismIds: string[] = queries
        .map(({ obj }) => obj.organismId)
        .filter((organismId) => !!organismId) as string[];

      const organisms = await prismaClient.organism.findMany({
        where: { id: { in: organismIds } },
      });

      return organismIds.map((cid) => organisms.find((c) => c.id === cid));
    },
    certificationAuthority: async (
      queries: { obj: { certificationAuthorityId?: string } }[]
    ) => {
      const certificationAuthorityIds: string[] = queries
        .map(({ obj }) => obj.certificationAuthorityId)
        .filter(
          (certificationAuthorityId) => !!certificationAuthorityId
        ) as string[];

      const certificationAuthorities =
        await prismaClient.certificationAuthority.findMany({
          where: { id: { in: certificationAuthorityIds } },
        });

      return certificationAuthorityIds.map((cid) =>
        certificationAuthorities.find((c) => c.id === cid)
      );
    },
  },
};
