import { Prisma, PrismaClient } from "@prisma/client";

import { injectCsvRows, readCsvRows } from "../read-csv";

const certificationsXp = [
  "9b3997dd-b7f1-4294-9452-7b133b8d40b5",
  "9140e7fb-b4a9-4969-973d-220d3cc1b6b0",
  "c64f7ebb-7c15-43d6-93fc-b337eb0b1ffd",
  "b8499961-4e6a-4ca2-a3f0-061e087d926b",
  "39df14b2-b6b4-4951-9795-e5a2dec26340",
  "da929b9d-6463-4682-a3f5-e95307f67d49",
  "3ee32529-6ce6-4b27-9294-73b4295a4af8",
  "ca4601d3-0bc8-412b-a774-3ea8372d2d54",
  "eebee2d3-2696-47f9-840e-859ff5fc324b",
  "bb2e7187-476e-478d-ab77-c38a0cd6ae83",
  "2de4679a-c385-4fe8-bb2d-b7c08f662ddb",
  "4c6a804c-a0c6-461b-a00a-6cc13e19a315",
  "14d38f55-639d-4d5b-80e8-396a3cbfa2be",
  "d37cf5c1-da1a-420f-b624-2b9cf4b54712",
  "e5a76f62-f35b-4d46-b19d-344cf1a623b5",
  "ac5e879b-c2d1-4039-85c0-5f3aed15251d",
  "654c9471-6e2e-4ff2-a5d8-2069e78ea0d6",
  "464b1c80-2951-4174-b462-3400cd65fddb",
  "994b9bc4-e9f5-42c3-8556-f2494d11ebb4",
];

export async function seedCertifications(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    //defer constraints validation till end of transaction
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "candidacy_region_certification_certification_id_fkey" DEFERRED;`
    );
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "organism_region_certification_certification_id_fkey" DEFERRED;`
    );
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "calaoc_certification" DEFERRED;`
    );
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "certification_authority_on_certification_certification_id_fkey" DEFERRED;`
    );

    // On supprime toutes les certifications, sauf celles de l'XP
    const { count } = await tx.certification.deleteMany({
      where: { id: { notIn: certificationsXp } },
    });
    console.log(`Deleted ${count} previous "new" certification(s)`);

    // Certifications : referentials/certifications.csv
    console.log(`Recreating certifications`);
    await injectCsvRows<
      Prisma.CertificationCreateInput & {
        level: string;
        isActive?: string;
      },
      Prisma.CertificationUpsertArgs
    >({
      filePath: "./referentials/certifications.csv",
      injectCommand: tx.certification.upsert,
      headersDefinition: [
        "rncpId",
        "isActive",
        "id",
        "label",
        "summary",
        undefined,
        "typeDiplome",
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
        typeDiplome,
        isActive,
        certificationAuthorityTag,
      }) => {
        const unquotedCertificationAuthorityTag =
          certificationAuthorityTag?.replace(/^"(.+)"$/, "$1");

        return {
          where: { id },
          create: {
            id,
            rncpId,
            label,
            level: parseInt(level),
            summary,
            typeDiplomeId: typeDiplome as string,
            status: isActive === "checked" ? "AVAILABLE" : "INACTIVE",
            certificationAuthorityTag: unquotedCertificationAuthorityTag,
          },
          update: {
            rncpId,
            label,
            level: parseInt(level),
            summary,
            typeDiplomeId: typeDiplome as string,
            status: isActive === "checked" ? "AVAILABLE" : "INACTIVE",
            certificationAuthorityTag: unquotedCertificationAuthorityTag,
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
    for (const {
      certificationId,
      conventionCollective,
      domaine,
    } of certificationRel) {
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
      if (domaine) {
        await tx.certificationOnDomaine.deleteMany({
          where: {
            certificationId,
          },
        });
        await tx.certificationOnDomaine.createMany({
          data: parseCsvList(domaine).map((domaineId: string) => ({
            certificationId,
            domaineId,
          })),
        });
      }
    }

    //defer constraints validation till end of transaction
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "candidacy_region_certification_certification_id_fkey" IMMEDIATE;`
    );
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "organism_region_certification_certification_id_fkey" IMMEDIATE;`
    );
    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "calaoc_certification" IMMEDIATE;`
    );

    await tx.$executeRawUnsafe(
      `SET CONSTRAINTS "certification_authority_on_certification_certification_id_fkey" IMMEDIATE;`
    );
  });
}

function parseCsvList(str: string): string[] {
  return str
    .trim()
    .split(",")
    .map((s: string) => s.trim());
}
