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

    console.log(`Recreating certifications`);

    const certsFromCsv = await readCsvRows<{
      id: string;
      label: string;
      rncpId: string;
      summary: string;
      level: string;
      isActive: string;
      certificationAuthorityTag: string;
    }>({
      filePath: "./referentials/certifications.csv",
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
    });

    for (const cert of certsFromCsv) {
      const certificationAuthorityStructure =
        await tx.certificationAuthorityStructure.findFirst({
          where: {
            label: cert.certificationAuthorityTag.replace(/^"(.+)"$/, "$1"),
          },
        });

      await tx.certification.create({
        data: {
          id: cert.id,
          firstVersionCertificationId: cert.id,
          rncpId: cert.rncpId,
          label: cert.label,
          summary: cert.summary,
          level: parseInt(cert.level),
          status:
            cert.isActive === "checked"
              ? "VALIDE_PAR_CERTIFICATEUR"
              : "INACTIVE",
          visible: cert.isActive === "checked",
          availableAt: new Date(),
          rncpExpiresAt: new Date(),
          certificationAuthorityStructureId:
            certificationAuthorityStructure?.id,
        },
      });
    }

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
