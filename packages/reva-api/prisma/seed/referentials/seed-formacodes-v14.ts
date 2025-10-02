import * as fs from "fs";
import * as path from "path";

import { parse } from "@fast-csv/parse";
import { Prisma, PrismaClient } from "@prisma/client";

type GrandDomaine = {
  code: string;
  label: string;
  children: string[];
};

async function readGrandsDomains(): Promise<GrandDomaine[]> {
  const grandsDomainesData = await readCsvRows<{
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
  }>({
    filePath: "./formacodes-grands-domaines-v14.csv",
    headersDefinition: ["A", "B", "C", "D", "E", "F"],
    delimiter: ";",
  });

  const grandsDomaines: GrandDomaine[] = [];

  for (const code of grandsDomainesData) {
    const { A, C, D } = code;

    const formattedGrandDomaine: GrandDomaine = {
      code: A,
      label: C,
      children: D.split("###").map((label: string) =>
        label.substring(label.length - 5, label.length - 2),
      ),
    };

    grandsDomaines.push(formattedGrandDomaine);
  }

  return grandsDomaines;
}

type Formacode = Prisma.FormacodeCreateManyInput;

async function readFormacodes(): Promise<Formacode[]> {
  const formacodesData = await readCsvRows<{
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G: string;
    H: string;
    I: string;
    J: string;
    K: string;
    L: string;
    M: string;
    N: string;
  }>({
    filePath: "./formacodes-v14.csv",
    headersDefinition: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
    ],
    delimiter: ";",
  });

  const grandsDomaines = await readGrandsDomains();

  const formacodes: Formacode[] = [];

  // add grand domaine
  for (const grandDomaine of grandsDomaines) {
    const formattedGrandDomaine: Formacode = {
      code: grandDomaine.code,
      label: grandDomaine.label,
      type: "DOMAIN",
      version: "v14",
    };

    if (!checkIfExists(formattedGrandDomaine, formacodes)) {
      formacodes.push(formattedGrandDomaine);
    }
  }

  for (const formacode of formacodesData) {
    const { A: code, C: label, D: semantic, G: parent } = formacode;

    const subDomain: Formacode = {
      code: semantic.substring(0, 3),
      label: semantic.substring(4, semantic.length),
      type: "SUB_DOMAIN",
      version: "v14",
    };

    const grandDomaine = grandsDomaines.find(
      (gd) => gd.children.indexOf(subDomain.code) != -1,
    );

    if (!grandDomaine) {
      throw new Error(
        `Grand Domaine is missing for domaine ${subDomain.code} - ${subDomain.label}`,
      );
    }

    subDomain.parentCode = grandDomaine.code;

    if (!checkIfExists(subDomain, formacodes)) {
      formacodes.push(subDomain);
    }

    let parentCode: string | undefined;

    try {
      parentCode = parseInt(parent.split(" - ")?.reverse()?.[0]).toString();
      if (parentCode == "NaN") {
        parentCode = undefined;
      }
    } catch (_error) {
      parentCode = undefined;
    }

    const keyword: Formacode = {
      code: code,
      label: label,
      type: "KEYWORD",
      parentCode: parentCode || subDomain.code,
      version: "v14",
    };

    if (!checkIfExists(keyword, formacodes)) {
      formacodes.push(keyword);
    }
  }

  return formacodes;
}

function checkIfExists(formacode: Formacode, formacodes: Formacode[]) {
  return formacodes.findIndex((code) => code.code == formacode.code) != -1;
}

interface ReadCsvRowsParams<T> {
  filePath: string;
  headersDefinition: Array<keyof T | undefined>;
  delimiter?: string;
}

function readCsvRows<T>({
  filePath,
  headersDefinition,
  delimiter,
}: ReadCsvRowsParams<T>): Promise<T[]> {
  return new Promise((resolve, error) => {
    const rows: T[] = [];
    fs.createReadStream(path.resolve(__dirname, filePath)).pipe(
      parse({
        headers: headersDefinition as Array<string | undefined>,
        renameHeaders: true,
        delimiter,
      })
        .on("error", (err) => {
          error(err);
        })
        .on("data", (row) => {
          rows.push(row as T);
        })
        .on("end", () => {
          resolve(rows);
        }),
    );
  });
}

export async function seedFormacodesV14(prisma: PrismaClient) {
  await prisma.formacode.deleteMany({
    where: {
      version: "v14",
    },
  });

  const formacodes = await readFormacodes();

  await prisma.$transaction(
    async (tx) => {
      await tx.formacode.createMany({
        data: formacodes,
      });
    },
    { maxWait: 5000, timeout: 15000 },
  );
}
