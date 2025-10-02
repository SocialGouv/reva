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
    G: string;
    H: string;
    I: string;
    J: string;
    K: string;
    L: string;
    M: string;
    N: string;
    O: string;
    P: string;
    Q: string;
    R: string;
    S: string;
  }>({
    filePath: "./formacodes-grands-domaines-v13.csv",
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
      "O",
      "P",
      "Q",
      "R",
      "S",
    ],
    delimiter: ";",
  });

  const grandsDomaines: GrandDomaine[] = [];

  for (const code of grandsDomainesData) {
    const { A, B, J } = code;

    const formattedGrandDomaine: GrandDomaine = {
      code: A,
      label: B,
      children: J.split("$").map((label: string) => label.substring(0, 3)),
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
  }>({
    filePath: "./formacodes-v13.csv",
    headersDefinition: ["A", "B", "C", "D", "E", "F", "G", "H"],
    delimiter: ";",
  });

  const grandsDomaines = await readGrandsDomains();

  const formacodes: Formacode[] = [];

  let codeA = "";
  let codeC = "";
  let codeD = "";
  let codeE = "";
  let codeF = "";
  let codeG = "";

  for (const code of formacodesData) {
    const { A, B, C, D, E, F, G, H } = code;

    if (C) {
      const grandDomaine = grandsDomaines.find(
        (gd) => gd.children.indexOf(A) != -1,
      );
      if (!grandDomaine) {
        throw new Error(`Grand Domaine is missing for domaine ${A} - ${B}`);
      }
      const formattedCodeGrandDomain: Formacode = {
        code: grandDomaine.code,
        label: grandDomaine.label,
        type: "DOMAIN",
        version: "v13",
      };
      if (!checkIfExists(formattedCodeGrandDomain, formacodes)) {
        formacodes.push(formattedCodeGrandDomain);
      }

      const formattedCode: Formacode = {
        code: A,
        label: B,
        type: "SUB_DOMAIN",
        parentCode: grandDomaine.code,
        version: "v13",
      };
      codeA = formattedCode.code;

      if (!checkIfExists(formattedCode, formacodes)) {
        formacodes.push(formattedCode);
      }

      const formattedCodeC: Formacode = getFormattedCode(C, codeA);
      codeC = formattedCodeC.code;
      if (!checkIfExists(formattedCodeC, formacodes)) {
        formacodes.push(formattedCodeC);
      }
    } else if (D) {
      const formattedCode: Formacode = getFormattedCode(D, codeC);
      codeD = formattedCode.code;
      if (!checkIfExists(formattedCode, formacodes)) {
        formacodes.push(formattedCode);
      }
    } else if (E) {
      const formattedCode: Formacode = getFormattedCode(E, codeD);
      codeE = formattedCode.code;
      if (!checkIfExists(formattedCode, formacodes)) {
        formacodes.push(formattedCode);
      }
    } else if (F) {
      const formattedCode: Formacode = getFormattedCode(F, codeE);
      codeF = formattedCode.code;
      if (!checkIfExists(formattedCode, formacodes)) {
        formacodes.push(formattedCode);
      }
    } else if (G) {
      const formattedCode: Formacode = getFormattedCode(G, codeF);
      codeG = formattedCode.code;
      if (!checkIfExists(formattedCode, formacodes)) {
        formacodes.push(formattedCode);
      }
    } else if (H) {
      const formattedCode: Formacode = getFormattedCode(H, codeG);
      if (!checkIfExists(formattedCode, formacodes)) {
        formacodes.push(formattedCode);
      }
    }
  }

  return formacodes;
}

function checkIfExists(formacode: Formacode, formacodes: Formacode[]) {
  return formacodes.findIndex((code) => code.code == formacode.code) != -1;
}

function getCodeFromLabel(label: string): { code: string; label: string } {
  const data = label.split(" ");
  const code = data.pop() as string;
  return { code, label: data.join(" ") };
}

function getFormattedCode(label: string, parentCode: string): Formacode {
  const data = getCodeFromLabel(label);
  const formattedCode: Formacode = {
    code: data.code,
    label: data.label,
    parentCode: parentCode,
    type: "KEYWORD",
    version: "v13",
  };

  return formattedCode;
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

export async function seedFormacodesV13(prisma: PrismaClient) {
  await prisma.formacode.deleteMany({
    where: {
      version: "v13",
    },
  });

  await prisma.$transaction(
    async (tx) => {
      const formacodes = await readFormacodes();

      await tx.formacode.createMany({
        data: formacodes,
      });
    },
    { maxWait: 5000, timeout: 15000 },
  );
}
