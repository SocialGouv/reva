import { prismaClient } from "../../../prisma/client";

type SubDomain = {
  id: string;
  code: string;
  label: string;
};

type Domain = {
  id: string;
  code: string;
  label: string;
  children: SubDomain[];
};

export const getDomainsByCertificationId = async ({
  certificationId,
}: {
  certificationId: string;
}): Promise<Domain[]> => {
  const items = await prismaClient.certificationOnFormacode.findMany({
    where: { certificationId },
    include: {
      formacode: {
        include: { parent: true },
      },
    },
  });

  const domains: Domain[] = [];

  for (const item of items) {
    const parent = item.formacode.parent;
    if (!parent) {
      throw new Error(
        `Le domaine pour le sous domaine RNCP ${item.formacode.code} n'a pas été trouvé`,
      );
    }

    const subDomain: SubDomain = {
      id: item.formacode.id,
      code: item.formacode.code,
      label: item.formacode.label
        .toLowerCase()
        .replace(/^./, (str) => str.toUpperCase()),
    };
    const domain: Domain | undefined = domains.find((d) => d.id == parent.id);

    if (domain) {
      domain.children.push(subDomain);
    } else {
      domains.push({
        id: parent.id,
        code: parent.code,
        label: parent.label,
        children: [subDomain],
      });
    }
  }

  return domains;
};
