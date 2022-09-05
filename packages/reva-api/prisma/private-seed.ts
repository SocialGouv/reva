import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
const prisma = new PrismaClient();



async function main() {
  console.log("private seed");

  const generateCertificationsMap = () => new Promise((resolve, reject) => {
    const certificationsFilePath = path.resolve(__dirname, 'private', 'data-certifications.csv');
    const certificationsFileExists = fs.existsSync(certificationsFilePath);

    if (!certificationsFileExists) {
      return reject(`${certificationsFilePath} not found`);
    }

    let promiseChain: Promise<Map<string, string>> = Promise.resolve(new Map());
    fs.createReadStream(certificationsFilePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => promiseChain = promiseChain.then(async (certificationMap) => {
        certificationMap.set(row.label.trim(), row.rncp_id.trim());
        return certificationMap;
      }))
      .on('end', (rowCount: number) => {
        promiseChain.then((certificationMap) => {
          resolve(certificationMap);
        });
        console.log(`Parsed ${rowCount} certifications`);
      });


  });

  const certificationsMap = await generateCertificationsMap() as any;

  const regions = await prisma.region.findMany();

  const regionsMap = regions.reduce((acc, region) => {
    acc.set(region.label, region);
    return acc;
  }, new Map());


  const insertOrganisms = () => new Promise((resolve, reject) => {
    const organismsFilePath = path.resolve(__dirname, 'private', 'data-organisms.csv');
    const organismsFileExists = fs.existsSync(organismsFilePath);

    if (!organismsFileExists) {
      return reject(`${organismsFilePath} not found`);
    }

    let promiseChain = Promise.resolve();
    fs.createReadStream(organismsFilePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => promiseChain = promiseChain.then(async () => {
        await prisma.organism.upsert({
          where: { label: row.label.trim() },
          update: {},
          create: {
            label: row.label.trim(),
            address: row.address.trim(),
            zip: row.zip.trim().replace(' ', ''),
            city: row.city.trim(),
            contactAdministrativeEmail: row.contact_administrative_email.trim(),
            contactCommercialName: row.contact_commercial_name.trim(),
            contactCommercialEmail: row.contact_commercial_email.trim(),
            siret: row.siret.trim().replace(' ', ''),
            isActive: row.is_active.trim() === '1'
          }
        });
      }))
      .on('end', (rowCount: number) => {
        promiseChain.then(() => resolve('done'));
        console.log(`Parsed ${rowCount} rows`);
      });
  });
  
  await insertOrganisms();


  const organisms = await prisma.organism.findMany();

  // Link region organism and certification
  const insertRelationship = () => new Promise((resolve, reject) => {
    const relationshipFilePath = path.resolve(__dirname, 'private', 'data-organisms-certifications-regions.csv');
    const relationshipFileExists = fs.existsSync(relationshipFilePath);

    if (!relationshipFileExists) {
      return reject(`${relationshipFilePath} not found`);
    }

    let promiseChain = Promise.resolve();
    fs.createReadStream(relationshipFilePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => promiseChain = promiseChain.then(async () => {
        console.log(row);
        if (!certificationsMap.get(row.certification)) {
          return;
        }

        if (row.region === "Toutes régions") {
          await Promise.all(regions.map(async region => {
            const existingResult = await prisma.organismsOnRegionsAndCertifications.findFirst({
              where: {
                certification: {
                  rncpId: certificationsMap.get(row.certification),
                },
                region: {
                  id: region.id,
                },
                organism: {
                  label: row.organism
                }
              }
            });
            
            if (!existingResult) {
              await prisma.organismsOnRegionsAndCertifications.create({
                data: {
                  certification: {
                    connect: {
                      rncpId: certificationsMap.get(row.certification),
                    }
                  },
                  region: {
                    connect: {
                      id: region.id,
                    }
                  },
                  organism: {
                    connect: {
                      label: row.organism
                    }
                  },
                  isArchitect: row.is_architect === 'Oui',
                  isCompanion: row.is_companion === 'Oui',
                }
              });
            } else {
              await prisma.organismsOnRegionsAndCertifications.update({
                where: {
                  id: existingResult.id
                },
                data: {
                  isArchitect: row.is_architect === 'Oui',
                  isCompanion: row.is_companion === 'Oui',
                }
              });
            }
          }
          ));
        } else {
          
          const existingResult = await prisma.organismsOnRegionsAndCertifications.findFirst({
            where: {
              certification: {
                rncpId: certificationsMap.get(row.certification),
              },
              region: {
                id: regionsMap.get(row.region).id,
              },
              organism: {
                label: row.organism
              }
            }
          });
          
          if (!existingResult) {
            await prisma.organismsOnRegionsAndCertifications.create({
              data: {
                certification: {
                  connect: {
                    rncpId: certificationsMap.get(row.certification),
                  }
                },
                region: {
                  connect: {
                    id: regionsMap.get(row.region).id,
                  }
                },
                organism: {
                  connect: {
                    label: row.organism
                  }
                },
                isArchitect: row.is_architect === 'Oui',
                isCompanion: row.is_companion === 'Oui',
              }
            });
          } else {
              await prisma.organismsOnRegionsAndCertifications.updateMany({
                where: {
                  id: existingResult.id
                },
                data: {
                  isArchitect: row.is_architect === 'Oui',
                  isCompanion: row.is_companion === 'Oui',
                }
              });
            }
        }
      }))
      .on('end', (rowCount: number) => {
        promiseChain.then(() => resolve('done'));
        console.log(`Parsed ${rowCount} rows`);
      });


  });

  // await prisma.organismsOnRegionsAndCertifications.deleteMany();
  await insertRelationship();

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })
