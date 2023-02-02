import * as fs from "fs";
import * as path from "path";

import { PrismaClient } from "@prisma/client";
import * as csv from "fast-csv";

const prisma = new PrismaClient();

async function main() {
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
        console.log(`Parsed ${rowCount} rows`);
      });
  });

  await inserts;

  await prisma.certification.update({
    where: { rncpId: "36836" },
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

  console.log(`${(count as any)[0].count} certifications inserted`);

  await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW certification_search WITH DATA;
  `;
  await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW profession_search WITH DATA;
  `;

  // await prisma.companion.upsert({
  //   where: {
  //     name: 'Iperia'
  //   },
  //   update: {},
  //   create: {
  //     city: 'Paris',
  //     name: 'Iperia',
  //     street: '',
  //     zipCode: ''
  //   }
  // });

  await prisma.goal.upsert({
    where: {
      label: "Trouver plus facilement un emploi",
    },
    update: {},
    create: {
      label: "Trouver plus facilement un emploi",
      order: 1,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Être reconnu dans ma profession",
    },
    update: {},
    create: {
      label: "Être reconnu dans ma profession",
      order: 2,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Avoir un meilleur salaire",
    },
    update: {},
    create: {
      label: "Avoir un meilleur salaire",
      order: 3,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Me réorienter",
    },
    update: {},
    create: {
      label: "Me réorienter",
      order: 4,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Consolider mes acquis métier",
    },
    update: {},
    create: {
      label: "Consolider mes acquis métier",
      order: 5,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Me redonner confiance en moi",
    },
    update: {},
    create: {
      label: "Me redonner confiance en moi",
      order: 6,
      isActive: true,
    },
  });
  await prisma.goal.upsert({
    where: {
      label: "Autre",
    },
    update: {},
    create: {
      label: "Autre",
      order: 7,
      isActive: true,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)`,
    },
    update: {},
    create: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Equipier de Première Intervention`,
    },
    update: {},
    create: {
      label: `Equipier de Première Intervention`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Sauveteur Secouriste du Travail (SST)`,
    },
    update: {},
    create: {
      label: `Sauveteur Secouriste du Travail (SST)`,
    },
  });

  await prisma.training.upsert({
    where: {
      label: `Systèmes d'attaches`,
    },
    update: {},
    create: {
      label: `Systèmes d'attaches`,
    },
  });

  const regions = [
    {
      label: "Île-de-France",
      code: "11",
    },
    {
      label: "Centre-Val de Loire",
      code: "24",
    },
    {
      label: "Bourgogne-Franche-Comté",
      code: "27",
    },
    {
      label: "Normandie",
      code: "28",
    },
    {
      label: "Hauts-de-France",
      code: "32",
    },
    {
      label: "Grand Est",
      code: "44",
    },
    {
      label: "Pays de la Loire",
      code: "52",
    },
    {
      label: "Bretagne",
      code: "53",
    },
    {
      label: "Nouvelle-Aquitaine",
      code: "75",
    },
    {
      label: "Occitanie",
      code: "76",
    },
    {
      label: "Auvergne-Rhône-Alpes",
      code: "84",
    },
    {
      label: "Provence-Alpes-Côte d'Azur",
      code: "93",
    },
    {
      label: "Corse",
      code: "94",
    },
    {
      label: "Guadeloupe",
      code: "01",
    },
    {
      label: "Martinique",
      code: "02",
    },
    {
      label: "Guyane",
      code: "03",
    },
    {
      label: "La Réunion",
      code: "04",
    },
    {
      label: "Mayotte",
      code: "06",
    },
  ];

  await Promise.all(
    regions.map(async (region) => {
      await prisma.region.upsert({
        where: { code: region.code },
        update: {},
        create: {
          label: region.label,
          code: region.code,
        },
      });
    })
  );

  const departments = [
    { label: "Ain", code: "01", codeRegion: "84" },
    { label: "Aisne", code: "02", codeRegion: "32" },
    { label: "Allier", code: "03", codeRegion: "84" },
    { label: "Alpes-de-Haute-Provence", code: "04", codeRegion: "93" },
    { label: "Hautes-Alpes", code: "05", codeRegion: "93" },
    { label: "Alpes-Maritimes", code: "06", codeRegion: "93" },
    { label: "Ardèche", code: "07", codeRegion: "84" },
    { label: "Ardennes", code: "08", codeRegion: "44" },
    { label: "Ariège", code: "09", codeRegion: "76" },
    { label: "Aube", code: "10", codeRegion: "44" },
    { label: "Aude", code: "11", codeRegion: "76" },
    { label: "Aveyron", code: "12", codeRegion: "76" },
    { label: "Bouches-du-Rhône", code: "13", codeRegion: "93" },
    { label: "Calvados", code: "14", codeRegion: "28" },
    { label: "Cantal", code: "15", codeRegion: "84" },
    { label: "Charente", code: "16", codeRegion: "75" },
    { label: "Charente-Maritime", code: "17", codeRegion: "75" },
    { label: "Cher", code: "18", codeRegion: "24" },
    { label: "Corrèze", code: "19", codeRegion: "75" },
    { label: "Côte-d'Or", code: "21", codeRegion: "27" },
    { label: "Côtes-d'Armor", code: "22", codeRegion: "53" },
    { label: "Creuse", code: "23", codeRegion: "75" },
    { label: "Dordogne", code: "24", codeRegion: "75" },
    { label: "Doubs", code: "25", codeRegion: "27" },
    { label: "Drôme", code: "26", codeRegion: "84" },
    { label: "Eure", code: "27", codeRegion: "28" },
    { label: "Eure-et-Loir", code: "28", codeRegion: "24" },
    { label: "Finistère", code: "29", codeRegion: "53" },
    { label: "Corse-du-Sud", code: "2A", codeRegion: "94" },
    { label: "Haute-Corse", code: "2B", codeRegion: "94" },
    { label: "Gard", code: "30", codeRegion: "76" },
    { label: "Haute-Garonne", code: "31", codeRegion: "76" },
    { label: "Gers", code: "32", codeRegion: "76" },
    { label: "Gironde", code: "33", codeRegion: "75" },
    { label: "Hérault", code: "34", codeRegion: "76" },
    { label: "Ille-et-Vilaine", code: "35", codeRegion: "53" },
    { label: "Indre", code: "36", codeRegion: "24" },
    { label: "Indre-et-Loire", code: "37", codeRegion: "24" },
    { label: "Isère", code: "38", codeRegion: "84" },
    { label: "Jura", code: "39", codeRegion: "27" },
    { label: "Landes", code: "40", codeRegion: "75" },
    { label: "Loir-et-Cher", code: "41", codeRegion: "24" },
    { label: "Loire", code: "42", codeRegion: "84" },
    { label: "Haute-Loire", code: "43", codeRegion: "84" },
    { label: "Loire-Atlantique", code: "44", codeRegion: "52" },
    { label: "Loiret", code: "45", codeRegion: "24" },
    { label: "Lot", code: "46", codeRegion: "76" },
    { label: "Lot-et-Garonne", code: "47", codeRegion: "75" },
    { label: "Lozère", code: "48", codeRegion: "76" },
    { label: "Maine-et-Loire", code: "49", codeRegion: "52" },
    { label: "Manche", code: "50", codeRegion: "28" },
    { label: "Marne", code: "51", codeRegion: "44" },
    { label: "Haute-Marne", code: "52", codeRegion: "44" },
    { label: "Mayenne", code: "53", codeRegion: "52" },
    { label: "Meurthe-et-Moselle", code: "54", codeRegion: "44" },
    { label: "Meuse", code: "55", codeRegion: "44" },
    { label: "Morbihan", code: "56", codeRegion: "53" },
    { label: "Moselle", code: "57", codeRegion: "44" },
    { label: "Nièvre", code: "58", codeRegion: "27" },
    { label: "Nord", code: "59", codeRegion: "32" },
    { label: "Oise", code: "60", codeRegion: "32" },
    { label: "Orne", code: "61", codeRegion: "28" },
    { label: "Pas-de-Calais", code: "62", codeRegion: "32" },
    { label: "Puy-de-Dôme", code: "63", codeRegion: "84" },
    { label: "Pyrénées-Atlantiques", code: "64", codeRegion: "75" },
    { label: "Hautes-Pyrénées", code: "65", codeRegion: "76" },
    { label: "Pyrénées-Orientales", code: "66", codeRegion: "76" },
    { label: "Bas-Rhin", code: "67", codeRegion: "44" },
    { label: "Haut-Rhin", code: "68", codeRegion: "44" },
    { label: "Rhône", code: "69", codeRegion: "84" },
    { label: "Haute-Saône", code: "70", codeRegion: "27" },
    { label: "Saône-et-Loire", code: "71", codeRegion: "27" },
    { label: "Sarthe", code: "72", codeRegion: "52" },
    { label: "Savoie", code: "73", codeRegion: "84" },
    { label: "Haute-Savoie", code: "74", codeRegion: "84" },
    { label: "Paris", code: "75", codeRegion: "11" },
    { label: "Seine-Maritime", code: "76", codeRegion: "28" },
    { label: "Seine-et-Marne", code: "77", codeRegion: "11" },
    { label: "Yvelines", code: "78", codeRegion: "11" },
    { label: "Deux-Sèvres", code: "79", codeRegion: "75" },
    { label: "Somme", code: "80", codeRegion: "32" },
    { label: "Tarn", code: "81", codeRegion: "76" },
    { label: "Tarn-et-Garonne", code: "82", codeRegion: "76" },
    { label: "Var", code: "83", codeRegion: "93" },
    { label: "Vaucluse", code: "84", codeRegion: "93" },
    { label: "Vendée", code: "85", codeRegion: "52" },
    { label: "Vienne", code: "86", codeRegion: "75" },
    { label: "Haute-Vienne", code: "87", codeRegion: "75" },
    { label: "Vosges", code: "88", codeRegion: "44" },
    { label: "Yonne", code: "89", codeRegion: "27" },
    { label: "Territoire de Belfort", code: "90", codeRegion: "27" },
    { label: "Essonne", code: "91", codeRegion: "11" },
    { label: "Hauts-de-Seine", code: "92", codeRegion: "11" },
    { label: "Seine-Saint-Denis", code: "93", codeRegion: "11" },
    { label: "Val-de-Marne", code: "94", codeRegion: "11" },
    { label: "Val-d'Oise", code: "95", codeRegion: "11" },
    { label: "Guadeloupe", code: "971", codeRegion: "01" },
    { label: "Martinique", code: "972", codeRegion: "02" },
    { label: "Guyane", code: "973", codeRegion: "03" },
    { label: "La Réunion", code: "974", codeRegion: "04" },
    { label: "Mayotte", code: "976", codeRegion: "06" },
  ];
  const countDepartments = await prisma.department.count();

  if (countDepartments === 0) {
    await Promise.all(
      departments.map(async (department) => {
        await prisma.department.create({
          data: {
            code: department.code,
            label: department.label,
            region: {
              connect: {
                code: department.codeRegion,
              },
            },
          },
        });
      })
    );
  }

  const basicSkillCount = await prisma.basicSkill.count();

  if (basicSkillCount === 0) {
    await prisma.basicSkill.createMany({
      data: [
        { label: "Usage et communication numérique" },
        {
          label:
            "Utilisation des règles de base de calcul et du raisonnement mathématique",
        },
        { label: "Communication en français" },
      ],
    });
  }

  const degreesCount = await prisma.degree.count();

  if (degreesCount === 0) {
    await prisma.degree.createMany({
      data: [
        {
          code: "N1_SANS",
          label: "Niveau 1 : Sans qualification",
          longLabel: "Niveau 1 : Sans qualification (hors Cléa)",
          level: 1,
        },
        {
          code: "N2_CLEA",
          label: "Niveau 2 : Cléa",
          longLabel: "Niveau 2 : Cléa",
          level: 2,
        },
        {
          code: "N3_CAP_BEP",
          label: "Niveau 3 : CAP, BEP",
          longLabel: "Niveau 3 : CAP, BEP",
          level: 3,
        },
        {
          code: "N4_BAC",
          label: "Niveau 4 : Baccalauréat",
          longLabel: "Niveau 4 : Baccalauréat",
          level: 4,
        },
        {
          code: "N5_BAC_2",
          label: "Niveau 5 : Bac + 2",
          longLabel: "Niveau 5 : Bac + 2 (DEUG, BTS, DUT, DEUST)",
          level: 5,
        },
        {
          code: "N6_BAC_3_4",
          label: "Niveau 6 : Bac + 3 et Bac + 4",
          longLabel:
            "Niveau 6 : Bac + 3 (Licence, Licence LMD, licence professionnelle) et Bac + 4 (Maîtrise)",
          level: 6,
        },
        {
          code: "N7_BAC_5",
          label: "Niveau 7 : Bac + 5",
          longLabel:
            "Niveau 7 : Bac + 5 (Master, DEA, DESS, diplôme d'ingénieur)",
          level: 7,
        },
        {
          code: "N8_BAC_8",
          label: "Niveau 8 : Bac + 8",
          longLabel:
            "Niveau 8 : Bac + 8 (Doctorat, habilitation à diriger des recherches)",
          level: 8,
        },
      ],
    });
  }

  const vulnerabilityIndicatorsCount =
    await prisma.vulnerabilityIndicator.count();

  if (vulnerabilityIndicatorsCount === 0) {
    await prisma.vulnerabilityIndicator.createMany({
      data: [
        { label: "Demandeur d'emploi >12m" },
        { label: "Bénéficiaire de minima sociaux" },
        { label: "RQTH" },
        { label: "Vide" },
      ],
    });
  }

  const dropOutReasonCount = await prisma.dropOutReason.count();

  if (dropOutReasonCount === 0) {
    await prisma.dropOutReason.createMany({
      data: [
        { label: "Reprise d’emploi" },
        { label: "Entrée en formation" },
        { label: "Découragement" },
        { label: "Raisons personnelles(santé, famille)" },
        { label: "Changement de projet" },
        { label: "Manque de temps" },
        { label: "Pas / plus intéressé" },
        { label: "Le parcours REVA / VAE ne répond pas à mes objectifs" },
        { label: "Rémunération non obtenue" },
        { label: "Financement non obtenu" },
        { label: "Avis architecte de parcours défavorable" },
        { label: "Report du projet à plus tard" },
        { label: "Autre" },
      ],
    });
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
