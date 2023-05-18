import * as fs from "fs";
import * as path from "path";

import { Prisma, PrismaClient } from "@prisma/client";
import * as csv from "fast-csv";

import { logger } from "../infra/logger";
import { upsertCsvRows } from "./read-csv";
import { insertDepartments } from "./referentials/table-departments";
import { upsertGoals } from "./referentials/table-goals";
import { upsertRegions } from "./referentials/table-regions";
import { insertBasicSkills } from "./referentials/table-basic-skills";
import { insertDegrees } from "./referentials/table-degrees";
import { insertVulnerabilityIndicators } from "./referentials/table-vulnerability-indicators";
import { insertDropOutReasons } from "./referentials/table-dropout-reasons";
import { insertReorientationReasons } from "./referentials/table-reorientation-reasons";

export const prisma = new PrismaClient();

async function main() {
  const certificationsCount = await prisma.certification.count();

  if (certificationsCount === 0) {
    const inserts = new Promise((resolve, reject) => {
      let promiseChain = Promise.resolve();
      fs.createReadStream(path.resolve(__dirname, "data-seed.csv"))
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on(
          "data",
          (row) =>
            (promiseChain = promiseChain.then(async () => {
              await prisma.certification.upsert({
                where: { rncpId: row.rncp_id },
                update: {},
                create: {
                  label: row.label,
                  slug: row.slug,
                  summary: ``,
                  acronym: row.acronym,
                  level: Number.parseInt(row.level, 10),
                  activities: row.activities,
                  abilities: row.abilities,
                  accessibleJobType: row.accessible_job_type,
                  activityArea: row.activity_area,
                  rncpId: row.rncp_id,
                  status: "INACTIVE",
                },
              });
            }))
        )
        .on("end", (rowCount: number) => {
          promiseChain.then(() => resolve("done"));
          logger.info(`Parsed ${rowCount} rows`);
        });
    });

    await inserts;

    await prisma.certification.update({
      where: { rncpId: "2514" },
      data: {
        label: `Certificat d'Aptitude aux Fonctions d'Encadrement et de Responsable d'Unité d'Intervention Sociale (CAFERUIS)`,
        summary: `Le certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale atteste des compétences nécessaires pour animer une unité de travail dans le champ de l'intervention sociale et conduire son action dans le cadre du projet et des missions de l'employeur, ainsi que dans le cadre des politiques publiques.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "4503" },
      data: {
        label: `Diplôme d'Etat de Technicien de l'Intervention Sociale et Familiale (DETISF)`,
        summary: `Le technicien de l'intervention sociale et familiale effectue une intervention sociale préventive, éducative et réparatrice visant à favoriser l'autonomie des personnes et leur intégration dans leur environnement et à créer ou restaurer le lien social.`,
      },
    });

    // TODO: REVIEW DESCRIPTION
    await prisma.certification.update({
      where: { rncpId: "5983" },
      data: {
        label: `Titre à finalité professionnelle Surveillant - Visiteur de nuit en secteur social et médico-social`,
        summary: `Le surveillant - visiteur de nuit  exerce principalement au sein de  structures d'hébergement collectif accueillant des personnes âgées, des  personnes handicapées (adultes ou enfants), des personnes en situation  de précarité, des enfants en difficulté sociale et familiale.`,
      },
    });

    // TODO: REVIEW DESCRIPTION
    await prisma.certification.update({
      where: { rncpId: "13905" },
      data: {
        label: `Bac Pro Services aux personnes et territoires`,
        summary: `Le titulaire de ce diplôme offre des services de proximité aux personnes et aux territoires : services à destination des populations, services aux collectivités et aux entreprises ; services qui contribuent à l'attractivité et à la cohésion des territoires ruraux (services sociaux, prestations liées aux transports, aux loisirs, aux activités culturelles et sportives, au tourisme).`,
      },
    });

    // TODO: REVIEW DESCRIPTION
    await prisma.certification.update({
      where: { rncpId: "17163" },
      data: {
        label: `Titre à finalité professionnelle Conducteur accompagnateur de personnes à mobilité réduite (CApmr)`,
        summary: `Le conducteur accompagnateur accompagne les personnes à mobilité réduite du fait d'un handicap physique, mental, sensoriel ou intellectuel ou d'une forme de dépendance quelle qu'elle soit qui rend impossibles les déplacements sans accompagnement.`,
      },
    });

    // TODO: REVIEW DESCRIPTION
    await prisma.certification.update({
      where: { rncpId: "25085" },
      data: {
        label: `CAP agricole Services aux personnes et vente en espace rural`,
        summary: `Le titulaire du diplôme est un employé qualifié de niveau V, qui assure des activités de services aux personnes, qui se définissent comme l'ensemble des activités contribuant au mieux-être des personnes.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "34690" },
      data: {
        label: `Titre à finalité professionnelle Assistant de vie dépendance`,
        summary: `La mission de l'assistant de vie dépendance est d'accompagner des personnes dont l'autonomie est altérée dans la réalisation de leurs activités, pouvant aller des tâches courantes aux actes essentiels de la vie quotidienne.`,
      },
    });

    // TODO: REVIEW DESCRIPTION
    await prisma.certification.update({
      where: { rncpId: "34691" },
      data: {
        label: `Titre à finalité professionnelle Assistant maternel / Garde d'enfants`,
        summary: `L'Assistant maternel ou le Garde d'enfants prend en charge des enfants de la naissance à l'adolescence. Le mode de garde d'enfants chez un assistant maternel ou chez le particulier employeur est en France le premier mode de garde des enfants de moins de 3 ans, en dehors des gardes par la famille.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "34692" },
      data: {
        label: `Titre à finalité professionnelle Employé familial`,
        summary: `L'employé familial intervient au domicile des particuliers (en leur présence ou non) principalement pour l'entretien du cadre de vie, du linge et la préparation des repas. Il est amené à se déplacer aux différents domiciles des particuliers employeurs.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "35028" },
      data: {
        label: `Titre Professionnel Agent de service médico-social`,
        summary: `L'emploi s'exerce sous la hiérarchie du responsable hôtelier, au sein d'une équipe pluriprofessionnelle. Selon les compétences mises en œuvre, l'emploi s'exerce sous la responsabilité partagée du responsable hôtelier et du responsable soignant.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "35506" },
      data: {
        label: `Titre Professionnel Assistant de vie aux familles`,
        summary: `L'assistant(e)  de  vie  aux  familles  (ADVF) contribue au bien être des personnes au sein de leur foyer en respectant leur dignité, leur intégrité, leur vie privée et leur sécurité. Il (elle) assure la garde d'enfants vivant  à domicile.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "35513" },
      data: {
        label: `BUT Carrières sociales option Coordination et gestion des établissement et services sanitaires et sociaux`,
        summary: `Le Bachelor Universitaire de Technologie (BUT) « Carrières Sociales» parcours « Coordination et Gestion des Établissements et Services Sanitaires et Sociaux » concerne des métiers en lien avec la gestion, la coordination et l’encadrement d’équipe dans des structures et services sanitaires et sociaux mais également la gestion de projet, le suivi qualité, les parcours de santé-social.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "35830" },
      data: {
        label: `Diplôme d'Etat Aide-Soignant (DEAS)`,
        summary: `La certification mise en place par l'arrêté du 10 juin 2021 vise à répondre aux évolutions du  rôle de l'aide soignant. En tant que professionnel de santé, l'aide-soignant est habilité à dispenser des soins de la vie quotidienne ou des soins aigus pour préserver et restaurer la continuité de la vie.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "35832" },
      data: {
        label: `Diplôme d'Etat Auxiliaire de puériculture (DEAP)`,
        summary: `L'auxiliaire de puériculture réalise des activités d'éveil et des soins adaptés à l'évolution de l'état clinique visant au bien-être, à l'autonomie et au développement de l'enfant.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "35993" },
      data: {
        label: `Titre Professionnel Responsable Coordonnateur service au domicile`,
        summary: `Le responsable - coordonnateur services au domicile (RCSAD) assure l'interface entre les clients, les intervenants et la structure de services au domicile. Les activités du RCSAD varient en fonction de l'organisation de la structure, de la répartition des activités et des différents niveaux hiérarchiques.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "36004" },
      data: {
        label: `Diplôme d'Etat Accompagnant éducatif et social (DEAES)`,
        summary: `L'accompagnant éducatif et social réalise des interventions sociales au quotidien visant à accompagner la personne en situation de handicap ou touchée par un manque d'autonomie quelles qu'en soient l'origine ou la nature.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "28048" },
      data: {
        label: `CAP Accompagnant Educatif Petite Enfance`,
        summary: `Dans une finalité éducative le titulaire du C.A.P. Accompagnant éducatif petite enfance conduit des activités d’animation et d’éveil qui contribuent à la socialisation de l’enfant, à son autonomie et à l’acquisition du langage, des activités de soins du quotidien qui contribuent à répondre aux besoins physiologiques de l’enfant.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "12301" },
      data: {
        label: `Bac Pro Accompagnement, soins et services à la personne - en structure`,
        summary: `Le titulaire du baccalauréat professionnel  Accompagnement, soins et services à la personne option « en structure » exerce ses fonctions auprès de personnes en situation temporaire ou permanente de dépendance en structures collectives.`,
      },
    });

    await prisma.certification.update({
      where: { rncpId: "12296" },
      data: {
        label: `Bac Pro Accompagnement, soins et services à la personne - à domicile`,
        summary: `Le titulaire du baccalauréat professionnel « Accompagnement, soins et services à la personne option « à domicile » exerce ses fonctions auprès de familles, d'enfants, de personnes âgées, de personnes handicapées, vivant en logement privé, individuel ou collectif.`,
      },
    });

    const availableCertifications = [
      "17163",
      "5983",
      "34690",
      "34691",
      "34692",
      "35028",
      "35506",
      "35993",
      "13905",
      "25085",
      "28048",
      "12301",
      "12296",
      "35513",
      "36004",
      "2514",
      "4503",
      "35830",
      "35832",
    ];

    await prisma.$transaction([
      prisma.certification.updateMany({
        data: {
          status: "INACTIVE",
        },
        where: {
          rncpId: {
            notIn: availableCertifications,
          },
        },
      }),
      prisma.certification.updateMany({
        data: {
          status: "AVAILABLE",
        },
        where: {
          rncpId: {
            in: availableCertifications,
          },
        },
      }),
    ]);

    const count = await prisma.$queryRaw`
    select count(1) from certification;
  `;

    logger.info(`${(count as any)[0].count} certifications inserted`);

    await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW certification_search WITH DATA;
  `;
    await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW profession_search WITH DATA;
  `;
  }

  await upsertGoals(prisma);
  await upsertRegions(prisma);
  await insertDepartments(prisma);
  await insertBasicSkills(prisma);
  await insertDegrees(prisma);
  await insertVulnerabilityIndicators(prisma);
  await insertDropOutReasons(prisma);
  await insertReorientationReasons(prisma);

  // Domaines : referentials/domaines.csv
  await upsertCsvRows<Prisma.DomaineCreateInput, Prisma.DomaineUpsertArgs>({
    filePath: "./referentials/domaines.csv",
    headersDefinition: ["label", "id", "code", undefined],
    transform: ({ id, label, code }) => ({
      where: { id },
      create: { id, label, code },
      update: { label },
    }),
    upsertCommand: prisma.domaine.upsert,
  });

  // Conventions collectives : referentials/conventions-collectives.csv
  await upsertCsvRows<
    Prisma.ConventionCollectiveCreateInput,
    Prisma.ConventionCollectiveUpsertArgs
  >({
    filePath: "./referentials/conventions-collectives.csv",
    headersDefinition: ["label", "id", undefined, "code", undefined, undefined],
    transform: ({ id, label, code }) => ({
      where: { id },
      create: { id, label, code },
      update: { label },
    }),
    upsertCommand: prisma.conventionCollective.upsert,
  });

  // Types de diplôme : referentials/types-diplome.csv
  await upsertCsvRows<
    Prisma.TypeDiplomeCreateInput,
    Prisma.TypeDiplomeUpsertArgs
  >({
    filePath: "./referentials/types-diplome.csv",
    headersDefinition: ["label", "id", undefined],
    transform: ({ id, label }) => ({
      where: { id },
      create: { id, label },
      update: { label },
    }),
    upsertCommand: prisma.typeDiplome.upsert,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
