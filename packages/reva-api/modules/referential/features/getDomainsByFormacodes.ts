import { RNCPCertification } from "../rncp";
import { getFormacodes, Formacode } from "./getFormacodes";

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

export const getDomainsByFormacodes = async ({
  FORMACODES,
}: {
  FORMACODES: RNCPCertification["FORMACODES"];
}): Promise<Domain[]> => {
  const referential = await getFormacodes();

  const subDomains: Formacode[] = getSubdomains(FORMACODES, referential);

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
): Formacode[] => {
  const subDomains: Formacode[] = [];

  for (const rncpFormacode of FORMACODES) {
    const formacode = getFormacodeByCode(rncpFormacode.CODE, referential);

    if (!formacode) {
      throw new Error(
        `Le formacode avec le code ${rncpFormacode.CODE} n'existe pas dans le référentiel RNCP`,
      );
    }

    const parents = getParents(formacode, referential);
    const subDomain = parents.find(
      (formacode) => formacode.type == "SUB_DOMAIN",
    );
    if (
      subDomain &&
      subDomains.findIndex((domain) => domain.code == subDomain.code) == -1
    ) {
      subDomains.push(subDomain);
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
