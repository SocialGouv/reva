import { PrismaClient } from "@prisma/client";
import certifications from "./data/certifications.json";
import competencies from "./data/competencies.json";
import professions from "./data/professions.json";
import romes from "./data/romes.json";
import romesCertifications from "./data/rome_certifications.json";

const prisma = new PrismaClient();

async function main() {

    const certificationsCount = await prisma.certification.count();
    
    if (certificationsCount === 0) {
        await prisma.certification.createMany({
            data: certifications.map((c) => ({
                id: c.id,
                label: c.label,
                rncpId: c.rncp_id
            }))
        })
    }

    const romesCount = await prisma.rome.count();

    if (romesCount === 0) {
        await prisma.rome.createMany({
            data: romes.map((r) => ({
                id: r.id,
                code: r.code,
                label: r.label,
                slug: r.slug,
                url: r.url
            }))
        })
    }

    const romesOnCertificationsCount = await prisma.romesOnCertifications.count();

    if (romesOnCertificationsCount === 0) {
        await prisma.romesOnCertifications.createMany({
            data: romesCertifications.map((rc) => ({
                certificationId: rc.certification_id,
                romeId: rc.rome_id,
            }))
        })
    }

    const professionsCount = await prisma.profession.count();

    if (professionsCount === 0) {
        await prisma.profession.createMany({
            data: professions.map((p) => ({
                id: p.id,
                label: p.label,
                romeId: p.rome_id 
            }))
        })
    }

    const competenciesCount = await prisma.competency.count();

    if (competenciesCount === 0) {
        await prisma.competency.createMany({
            data: competencies.map((c) => ({
                label: c.Bloc_Competences_Libelle,
                blocId: c.Bloc_Competences_Code,
                certificationRncpId: `${c.Numero_Fiche}`
            })),
            skipDuplicates: true
        })
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
