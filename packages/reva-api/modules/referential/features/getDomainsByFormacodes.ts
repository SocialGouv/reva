import { logger } from "@/modules/shared/logger/logger";

import { RNCPCertification } from "../rncp/referential";

import { Formacode, getFormacodes } from "./getFormacodes";

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

type CertificationFormacode = Formacode & {
  isMain: boolean;
};

export const getDomainsByFormacodes = async ({
  FORMACODES,
}: {
  FORMACODES: RNCPCertification["FORMACODES"];
}): Promise<Domain[]> => {
  const referential = await getFormacodes();

  const subDomains = getSubdomains(FORMACODES, referential);

  const domains: Domain[] = [];

  for (const formacode of subDomains) {
    const parent = referential.find(
      (_formacode) => _formacode.code == formacode.parentCode,
    );
    if (!parent) {
      throw new Error(
        `Le domaine pour le sous domaine RNCP ${formacode.code} n'a pas été trouvé`,
      );
    }

    const subDomain: SubDomain = {
      id: formacode.id,
      code: formacode.code,
      label: formacode.label,
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

export const getSubdomains = (
  FORMACODES: RNCPCertification["FORMACODES"],
  referential: Formacode[],
): CertificationFormacode[] => {
  const subDomains: CertificationFormacode[] = [];

  for (let index = 0; index < FORMACODES.length; index++) {
    const isMain = index == 0;

    const rncpFormacode = FORMACODES[index];
    const formacode = getFormacodeByCode(rncpFormacode.CODE, referential);

    if (!formacode) {
      const error = new Error(
        `Le formacode avec le code ${rncpFormacode.CODE} n'existe pas dans le référentiel RNCP`,
      );
      logger.error(error);

      // stop here and continue with the next iteration
      continue;
    }

    const parents = getParents(formacode, referential);
    const subDomain = parents.find(
      (formacode) => formacode.type == "SUB_DOMAIN",
    );
    if (
      subDomain &&
      subDomains.findIndex((domain) => domain.code == subDomain.code) == -1
    ) {
      subDomains.push({
        ...subDomain,
        isMain,
      });
    }
  }

  return subDomains;
};

const getFormacodeByCode = (
  code: string,
  referential: Formacode[],
): Formacode | undefined => {
  return referential.find((formacode) => formacode.code == code);
};

const getParent = (child: Formacode, referential: Formacode[]) => {
  return referential.find((formacode) => formacode.code == child.parentCode);
};

const getParents = (
  formacode: Formacode,
  referential: Formacode[],
): Formacode[] => {
  const parent = getParent(formacode, referential);

  if (parent) {
    return [...getParents(parent, referential), formacode];
  }

  return [formacode];
};
