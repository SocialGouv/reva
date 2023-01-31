import { Prisma, PrismaClient } from "@prisma/client";
import activities from "./data/activities.json";
import certifications from "./data/certifications.json";
import competencies from "./data/competencies.json";
import professions from "./data/professions.json";
import romes from "./data/romes.json";
import romesCertifications from "./data/romes_certifications.json";
import romesCompetences from "./data/romes_competences.json";
import romesActivities from "./data/romes_activities.json";

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
                isActive: true
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
                codeOgr: c.code_ogr,
                label: c.libelle_competence,
                labeTypeCompetence : c.libelle_type_competence,
                isActive: c.statut === '1'
            })),
            skipDuplicates: true
        })
    }
    const activitiesCount = await prisma.activity.count();

    if (activitiesCount === 0) {
        await prisma.activity.createMany({
            data: activities.map((a) => ({
                codeOgr: a.code_ogr,
                label: a.libelle_activite,
                labeTypeActivity : a.libelle_activite,
            })),
            skipDuplicates: true
        })
    }

    const competenciesOnRomes = await prisma.competenciesOnRomes.count();

    if (competenciesOnRomes === 0) {
        await prisma.competenciesOnRomes.createMany({
            data: romesCompetences.map((r) => ({
                competencyCodeOgr: r.code_ogr,
                romeCode: r.code_rome,
            })),
            skipDuplicates: true
        })
    }
    
    const activitiesOnRomes = await prisma.activitiesOnRomes.count();

    if (activitiesOnRomes === 0) {
        await prisma.activitiesOnRomes.createMany({
            data: romesActivities.map((r) => ({
                activityCodeOgr: r.code_ogr,
                romeCode: r.code_rome,
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
