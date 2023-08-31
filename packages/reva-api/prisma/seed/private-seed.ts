import * as fs from "fs";
import * as path from "path";

import { PrismaClient } from "@prisma/client";
import * as csv from "fast-csv";

import { logger } from "../../modules/shared/logger";

const prisma = new PrismaClient();

async function main() {
  logger.info("private seed");

  const generateCertificationsMap = () =>
    new Promise((resolve, reject) => {
      const certificationsFilePath = path.resolve(
        __dirname,
        "referentials",
        "private",
        "data-certifications.csv"
      );
      const certificationsFileExists = fs.existsSync(certificationsFilePath);

      if (!certificationsFileExists) {
        return reject(`${certificationsFilePath} not found`);
      }

      let promiseChain: Promise<Map<string, string>> = Promise.resolve(
        new Map()
      );
      fs.createReadStream(certificationsFilePath)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on(
          "data",
          (row) =>
            (promiseChain = promiseChain.then(async (certificationMap) => {
              certificationMap.set(row.label.trim(), row.rncp_id.trim());
              return certificationMap;
            }))
        )
        .on("end", (rowCount: number) => {
          promiseChain.then((certificationMap) => {
            resolve(certificationMap);
          });
          logger.info(`Parsed ${rowCount} certifications`);
        });
    });

  const certificationsMap = (await generateCertificationsMap()) as any;

  const regions = await prisma.region.findMany();

  const regionsMap = regions.reduce((acc, region) => {
    acc.set(region.label, region);
    return acc;
  }, new Map());

  const insertOrganisms = () =>
    new Promise((resolve, reject) => {
      const organismsFilePath = path.resolve(
        __dirname,
        "referentials",
        "private",
        "data-organisms.csv"
      );
      const organismsFileExists = fs.existsSync(organismsFilePath);

      if (!organismsFileExists) {
        return reject(`${organismsFilePath} not found`);
      }

      let promiseChain = Promise.resolve();
      fs.createReadStream(organismsFilePath)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on(
          "data",
          (row) =>
            (promiseChain = promiseChain.then(async () => {
              await prisma.organism.upsert({
                where: { id: row.id.trim() },
                update: {
                  label: row.label.trim(),
                  address: row.address.trim(),
                  zip: row.zip.trim().replace(" ", ""),
                  city: row.city.trim(),
                  contactAdministrativeEmail:
                    row.contact_administrative_email.trim(),
                  siret: row.siret.trim().replace(" ", ""),
                },
                create: {
                  id: row.id.trim(),
                  label: row.label.trim(),
                  address: row.address.trim(),
                  zip: row.zip.trim().replace(" ", ""),
                  city: row.city.trim(),
                  contactAdministrativeEmail:
                    row.contact_administrative_email.trim(),
                  siret: row.siret.trim().replace(" ", ""),
                  isActive: row.is_active.trim() === "1",
                  typology: "experimentation",
                },
              });
            }))
        )
        .on("end", (rowCount: number) => {
          promiseChain.then(() => resolve("done"));
          logger.info(`Parsed ${rowCount} rows`);
        });
    });

  await insertOrganisms();

  await prisma.organism.findMany();

  // Link region organism and certification
  const insertRelationship = () =>
    new Promise((resolve, reject) => {
      const relationshipFilePath = path.resolve(
        __dirname,
        "referentials",
        "private",
        "data-organisms-certifications-regions.csv"
      );
      const relationshipFileExists = fs.existsSync(relationshipFilePath);

      if (!relationshipFileExists) {
        return reject(`${relationshipFilePath} not found`);
      }

      let promiseChain = Promise.resolve();
      fs.createReadStream(relationshipFilePath)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on(
          "data",
          (row) =>
            (promiseChain = promiseChain.then(async () => {
              const currentCertification = row.certification.trim();
              const currentOrganismId = row.organism.trim();
              if (!certificationsMap.get(currentCertification)) {
                return;
              }

              if (row.region === "Toutes régions") {
                await Promise.all(
                  regions.map(async (region) => {
                    const existingResult =
                      await prisma.organismsOnRegionsAndCertifications.findFirst(
                        {
                          where: {
                            certification: {
                              rncpId:
                                certificationsMap.get(currentCertification),
                            },
                            region: {
                              id: region.id,
                            },
                            organism: {
                              label: currentOrganismId,
                            },
                          },
                        }
                      );

                    if (!existingResult) {
                      const certId = (
                        await prisma.certification.findFirst({
                          where: {
                            rncpId: certificationsMap.get(currentCertification),
                          },
                        })
                      )?.id;
                      await prisma.organismsOnRegionsAndCertifications.create({
                        data: {
                          certification: {
                            connect: {
                              id: certId as string,
                            },
                          },
                          region: {
                            connect: {
                              id: region.id,
                            },
                          },
                          organism: {
                            connect: {
                              id: currentOrganismId,
                            },
                          },
                          isArchitect: row.is_architect === "Oui",
                          isCompanion: row.is_companion === "Oui",
                        },
                      });
                    } else {
                      await prisma.organismsOnRegionsAndCertifications.update({
                        where: {
                          id: existingResult.id,
                        },
                        data: {
                          isArchitect: row.is_architect === "Oui",
                          isCompanion: row.is_companion === "Oui",
                        },
                      });
                    }
                  })
                );
              } else {
                const existingResult =
                  await prisma.organismsOnRegionsAndCertifications.findFirst({
                    where: {
                      certification: {
                        rncpId: certificationsMap.get(currentCertification),
                      },
                      region: {
                        id: regionsMap.get(row.region).id,
                      },
                      organism: {
                        label: currentOrganismId,
                      },
                    },
                  });

                if (!existingResult) {
                  const certId = (
                    await prisma.certification.findFirst({
                      where: {
                        rncpId: certificationsMap.get(currentCertification),
                      },
                    })
                  )?.id;
                  await prisma.organismsOnRegionsAndCertifications.create({
                    data: {
                      certification: {
                        connect: {
                          id: certId,
                        },
                      },
                      region: {
                        connect: {
                          id: regionsMap.get(row.region).id,
                        },
                      },
                      organism: {
                        connect: {
                          id: currentOrganismId,
                        },
                      },
                      isArchitect: row.is_architect === "Oui",
                      isCompanion: row.is_companion === "Oui",
                    },
                  });
                } else {
                  await prisma.organismsOnRegionsAndCertifications.updateMany({
                    where: {
                      id: existingResult.id,
                    },
                    data: {
                      isArchitect: row.is_architect === "Oui",
                      isCompanion: row.is_companion === "Oui",
                    },
                  });
                }
              }
            }))
        )
        .on("end", (rowCount: number) => {
          promiseChain.then(() => resolve("done"));
          logger.info(`Parsed ${rowCount} rows`);
        });
    });

  await insertRelationship();

  const activeOrganisms = await prisma.organism.count({
    where: {
      isActive: true,
    },
  });

  if (activeOrganisms === 0) {
    await prisma.$queryRaw`
      UPDATE organism 
      SET is_active = true
      WHERE organism.id IN (
          SELECT DISTINCT o.id
          FROM organism o
          INNER JOIN organism_region_certification orc ON orc.organism_id = o.id
          INNER JOIN certification c ON c.id = orc.certification_id
          WHERE c.status = 'AVAILABLE'
          AND orc.is_architect = true
      );
    `;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
