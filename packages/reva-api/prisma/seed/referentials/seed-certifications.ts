import { Prisma, PrismaClient } from "@prisma/client";

import { injectCsvRows, readCsvRows } from "../read-csv";

export async function seedCertifications(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    await injectCsvRows<
      Prisma.CertificationAuthorityStructureCreateInput,
      Prisma.CertificationAuthorityStructureCreateArgs
    >({
      filePath: "./referentials/structures-certificatrices.csv",
      injectCommand: tx.certificationAuthorityStructure.create,
      headersDefinition: ["id", "label"],
      transform: ({ id, label }) => {
        const unquotedLabel = label?.replace(/^"(.+)"$/, "$1");
        return { data: { id, label: unquotedLabel } };
      },
    });

    // Certifications : referentials/certifications.csv
    console.log(`Recreating certifications`);
    await injectCsvRows<
      Prisma.CertificationCreateInput & {
        level: string;
        isActive?: string;
        certificationAuthorityTag: string;
      },
      Prisma.CertificationCreateArgs
    >({
      filePath: "./referentials/certifications.csv",
      injectCommand: tx.certification.create,
      headersDefinition: [
        "rncpId",
        "isActive",
        "id",
        "label",
        "summary",
        undefined,
        undefined,
        "level",
        undefined,
        undefined,
        undefined,
        undefined,
        "certificationAuthorityTag",
      ],
      transform: ({
        id,
        label,
        rncpId,
        summary,
        level,
        isActive,
        certificationAuthorityTag,
      }) => {
        const unquotedCertificationAuthorityTag =
          certificationAuthorityTag?.replace(/^"(.+)"$/, "$1") as string;

        return {
          data: {
            id,
            rncpId,
            label,
            level: parseInt(level),
            summary,
            status:
              isActive === "checked" ? "VALIDE_PAR_CERTIFICATEUR" : "INACTIVE",
            visible: isActive === "checked",
            availableAt: new Date(),
            expiresAt: new Date(),
            certificationAuthorityStructure: {
              connect: { label: unquotedCertificationAuthorityTag },
            },
          },
        };
      },
    });

    // Relations certifications
    console.log(`Recreating certifications links (domains, ccn etc..)`);
    const certificationRel = await readCsvRows<{
      certificationId: string;
      conventionCollective: string;
      domaine: string;
    }>({
      filePath: "./referentials/certifications.csv",
      headersDefinition: [
        undefined, // rncp
        undefined, // isActive
        "certificationId", // id
        undefined, // label
        undefined, // summary
        undefined, // acronym
        undefined, // typeDiplome
        undefined, // level
        undefined, // ccn
        "conventionCollective", // ccn
        undefined, // filière
        "domaine", // filière
        undefined,
      ],
    });
    for (const { certificationId, conventionCollective } of certificationRel) {
      if (conventionCollective) {
        await tx.certificationOnConventionCollective.deleteMany({
          where: {
            certificationId,
          },
        });
        await tx.certificationOnConventionCollective.createMany({
          data: parseCsvList(conventionCollective).map((ccnId: string) => ({
            certificationId,
            ccnId,
          })),
        });
      }
    }
  });
}

function parseCsvList(str: string): string[] {
  return str
    .trim()
    .split(",")
    .map((s: string) => s.trim());
}
