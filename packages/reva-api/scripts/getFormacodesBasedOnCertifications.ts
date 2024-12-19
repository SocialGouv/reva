import * as path from "path";
import { writeToPath } from "@fast-csv/format";

import { prismaClient } from "../prisma/client";

import {
  Formacode,
  getFormacodes,
} from "../modules/referential/features/getFormacodes";

type Params = {
  visible: boolean;
};

async function getAvailableFormacodes(params?: Params): Promise<Formacode[]> {
  const formacodes: Formacode[] = await getFormacodes();

  const certifications = params
    ? await prismaClient.certification.findMany({
        where: { visible: params.visible },
        include: { certificationOnFormacode: true },
      })
    : await prismaClient.certification.findMany({
        include: { certificationOnFormacode: true },
      });

  const availableFormacodes: { [key: string]: Formacode } = {};

  for (const certification of certifications) {
    const { certificationOnFormacode } = certification;

    for (const relation of certificationOnFormacode) {
      const formacode = formacodes.find((f) => f.id == relation.formacodeId);

      if (formacode) {
        availableFormacodes[formacode.id] = formacode;

        const parent =
          formacode.parentCode &&
          formacodes.find((f) => f.code == formacode.parentCode);

        if (parent) {
          availableFormacodes[parent.id] = parent;
        }
      }
    }
  }

  const mappedFormacodes = Object.keys(availableFormacodes).map(
    (key) => availableFormacodes[key],
  );

  return mappedFormacodes;
}

const main = async (csv_name: string, params?: Params) => {
  const formacodes = await getAvailableFormacodes(params);

  const domains = formacodes
    .filter((formacode) => formacode.type == "DOMAIN")
    .sort((f1, f2) => (f1.code < f2.code ? -1 : 1));
  const subDomains = formacodes
    .filter((formacode) => formacode.type == "SUB_DOMAIN")
    .sort((f1, f2) => (f1.code < f2.code ? -1 : 1));

  const rows = [
    ["id", "type", "code", "parentCode", "label"],
    ...domains
      .reduce((acc, domain) => {
        return [
          ...acc,
          domain,
          ...subDomains.filter(
            (subDomain) => subDomain.parentCode == domain.code,
          ),
        ];
      }, [] as Formacode[])
      .map(({ id, type, code, parentCode, label }) => [
        id,
        type,
        code,
        parentCode,
        label,
      ]),
  ];

  writeToPath(path.resolve(__dirname, `${csv_name}.csv`), rows)
    .on("error", (err) => console.error(err))
    .on("finish", () => console.log("Done writing."));
};

main("formacodes_on_all_certifications");
main("formacodes_on_visible_certifications", { visible: true });
main("formacodes_on_hidden_certifications", { visible: false });
