import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
const prisma = new PrismaClient();



async function main() {
  const inserts = new Promise((resolve, reject) => {
    let promiseChain = Promise.resolve();
    fs.createReadStream(path.resolve(__dirname, 'data-seed.csv'))
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => promiseChain = promiseChain.then(async () => {
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
            status: 'AVAILABLE',
          }
        });

      }))
      .on('end', (rowCount: number) => {
        promiseChain.then(() => resolve('done'));
        console.log(`Parsed ${rowCount} rows`);
      });
  });
  
  await inserts;

  await prisma.certification.update({
    where: { rncpId: '2514' },
    data: {
      label: `CAFERUIS Certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale`,
      summary: `Le certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale atteste des compétences nécessaires pour animer une unité de travail dans le champ de l'intervention sociale et conduire son action dans le cadre du projet et des missions de l'employeur, ainsi que dans le cadre des politiques publiques.`,
      status: 'INACTIVE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '4503' },
    data: {
      label: `Diplôme d'Etat Technicien de l'intervention sociale et familiale`,
      summary: `Le technicien de l'intervention sociale et familiale effectue une intervention sociale préventive, éducative et réparatrice visant à favoriser l'autonomie des personnes et leur intégration dans leur environnement et à créer ou restaurer le lien social.`,
      status: 'INACTIVE',
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '5983' },
    data: {
      label: `Titre Professionnel Surveillant - Veilleur de nuit en secteur social et médico-social`,
      summary: `Le surveillant - visiteur de nuit  exerce principalement au sein de  structures d'hébergement collectif accueillant des personnes âgées, des  personnes handicapées (adultes ou enfants), des personnes en situation  de précarité, des enfants en difficulté sociale et familiale.`,
      status: 'AVAILABLE',
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '13905' },
    data: {
      label: `Bac Pro Services aux personnes et aux territoires`,
      summary: `Le titulaire de ce diplôme offre des services de proximité aux personnes et aux territoires : services à destination des populations, services aux collectivités et aux entreprises ; services qui contribuent à l'attractivité et à la cohésion des territoires ruraux (services sociaux, prestations liées aux transports, aux loisirs, aux activités culturelles et sportives, au tourisme).`,
      status: 'INACTIVE',
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '17163' },
    data: {
      label: `Titre Professionnel Conducteur accompagnateur de personnes à mobilité réduite (CApmr)`,
      summary: `Le conducteur accompagnateur accompagne les personnes à mobilité réduite du fait d'un handicap physique, mental, sensoriel ou intellectuel ou d'une forme de dépendance quelle qu'elle soit qui rend impossibles les déplacements sans accompagnement.`,
      status: 'AVAILABLE',
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '25085' },
    data: {
      label: `CAP agricole Services aux personnes et vente en espace rural`,
      summary: `Le titulaire du diplôme est un employé qualifié de niveau V, qui assure des activités de services aux personnes, qui se définissent comme l'ensemble des activités contribuant au mieux-être des personnes.`,
      status: 'INACTIVE',
    }
  });
  
  await prisma.certification.update({
    where: { rncpId: '34690' },
    data: {
      label: `Titre Assistant de vie dépendance`,
      summary: `La mission de l'assistant de vie dépendance est d'accompagner des personnes dont l'autonomie est altérée dans la réalisation de leurs activités, pouvant aller des tâches courantes aux actes essentiels de la vie quotidienne.`,
      status: 'AVAILABLE',
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '34691' },
    data: {
      label: `Titre Professionnel Assistant maternel / Garde d'enfants`,
      summary: `L'Assistant maternel ou le Garde d'enfants prend en charge des enfants de la naissance à l'adolescence. Le mode de garde d'enfants chez un assistant maternel ou chez le particulier employeur est en France le premier mode de garde des enfants de moins de 3 ans, en dehors des gardes par la famille.`,
      status: 'AVAILABLE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '34692' },
    data: {
      label: `Titre Professionnel Employé familial`,
      summary: `L'employé familial intervient au domicile des particuliers (en leur présence ou non) principalement pour l'entretien du cadre de vie, du linge et la préparation des repas. Il est amené à se déplacer aux différents domiciles des particuliers employeurs.`,
      status: 'AVAILABLE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35028' },
    data: {
      label: `Titre Professionnel Agent de service médico-social`,
      summary: `L'emploi s'exerce sous la hiérarchie du responsable hôtelier, au sein d'une équipe pluriprofessionnelle. Selon les compétences mises en œuvre, l'emploi s'exerce sous la responsabilité partagée du responsable hôtelier et du responsable soignant.`,
      status: 'AVAILABLE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35506' },
    data: {
      label: `Titre Professionnel Assistant de vie aux familles`,
      summary: `L'assistant(e)  de  vie  aux  familles  (ADVF) contribue au bien être des personnes au sein de leur foyer en respectant leur dignité, leur intégrité, leur vie privée et leur sécurité. Il (elle) assure la garde d'enfants vivant  à domicile.`,
      status: 'AVAILABLE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35513' },
    data: {
      label: `BUT Carrières sociales`,
      summary: `Le Bachelor Universitaire de Technologie (BUT) « Carrières Sociales» parcours « Coordination et Gestion des Établissements et Services Sanitaires et Sociaux » concerne des métiers en lien avec la gestion, la coordination et l’encadrement d’équipe dans des structures et services sanitaires et sociaux mais également la gestion de projet, le suivi qualité, les parcours de santé-social.`,
      status: 'INACTIVE',
    }
  });
  
  await prisma.certification.update({
    where: { rncpId: '35830' },
    data: {
      label: `Diplôme d'Etat Aide-Soignant (DEAS)`,
      summary: `La certification mise en place par l'arrêté du 10 juin 2021 vise à répondre aux évolutions du  rôle de l'aide soignant. En tant que professionnel de santé, l'aide-soignant est habilité à dispenser des soins de la vie quotidienne ou des soins aigus pour préserver et restaurer la continuité de la vie.`,
      status: 'INACTIVE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35832' },
    data: {
      label: `Diplôme d'Etat Auxiliaire de puériculture`,
      summary: `L'auxiliaire de puériculture réalise des activités d'éveil et des soins adaptés à l'évolution de l'état clinique visant au bien-être, à l'autonomie et au développement de l'enfant.`,
      status: 'INACTIVE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35993' },
    data: {
      label: `Titre Professionnel Responsable coordonnateur service au domicile`,
      summary: `Le responsable - coordonnateur services au domicile (RCSAD) assure l'interface entre les clients, les intervenants et la structure de services au domicile. Les activités du RCSAD varient en fonction de l'organisation de la structure, de la répartition des activités et des différents niveaux hiérarchiques.`,
      status: 'AVAILABLE',
    }
  });

  await prisma.certification.update({
    where: { rncpId: '36004' },
    data: {
      label: `Diplôme d'Etat Accompagnant éducatif et social (DEAES)`,
      summary: `L'accompagnant éducatif et social réalise des interventions sociales au quotidien visant à accompagner la personne en situation de handicap ou touchée par un manque d'autonomie quelles qu'en soient l'origine ou la nature.`,
      status: 'INACTIVE',
    }
  });

  // await prisma.certification.update({
  //   where: { rncpId: '34827' },
  //   data: {
  //     status: 'INACTIVE',
  //   }
  // });

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
      label: "Trouver plus facilement un emploi"
    }, 
    update: {}, 
    create: {
      label: "Trouver plus facilement un emploi",
      order: 1,
      isActive: true
    }
  });
  await prisma.goal.upsert({
    where: { 
      label: "Être reconnu dans ma profession"
    }, 
    update: {}, 
    create: {
      label: "Être reconnu dans ma profession",
      order: 2,
      isActive: true
    }
  });
  await prisma.goal.upsert({
    where: { 
      label: "Avoir un meilleur salaire"
    }, 
    update: {}, 
    create: {
      label: "Avoir un meilleur salaire",
      order: 3,
      isActive: true
    }
  });
  await prisma.goal.upsert({
    where: { 
      label: "Me réorienter"
    }, 
    update: {}, 
    create: {
      label: "Me réorienter",
      order: 4,
      isActive: true
    }
  });
  await prisma.goal.upsert({
    where: { 
      label: "Consolider mes acquis métier"
    }, 
    update: {}, 
    create: {
      label: "Consolider mes acquis métier",
      order: 5,
      isActive: true
    }
  });
  await prisma.goal.upsert({
    where: { 
      label: "Me redonner confiance en moi"
    }, 
    update: {}, 
    create: {
      label: "Me redonner confiance en moi",
      order: 6,
      isActive: true
    }
  });
  await prisma.goal.upsert({
    where: { 
      label: "Autre"
    }, 
    update: {}, 
    create: {
      label: "Autre",
      order: 7,
      isActive: true
    }
  });


  await prisma.training.upsert({
    where: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)`
    },
    update: {},
    create: {
      label: `Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)`
    }
  });

  await prisma.training.upsert({
    where: {
      label: `Equipier de Première Intervention`
    },
    update: {},
    create: {
      label: `Equipier de Première Intervention`
    }
  });

  await prisma.training.upsert({
    where: {
      label: `Sauveteur Secouriste du Travail (SST)`
    },
    update: {},
    create: {
      label: `Sauveteur Secouriste du Travail (SST)`
    }
  });

  await prisma.training.upsert({
    where: {
      label: `Systèmes d'attaches`
    },
    update: {},
    create: {
      label: `Systèmes d'attaches`
    }
  });

  const regions = [
    {
      label: "Île-de-France",
      code: "11"
    },
    {
      label: "Centre-Val de Loire",
      code: "24"
    },
    {
      label: "Bourgogne-Franche-Comté",
      code: "27"
    },
    {
      label: "Normandie",
      code: "28"
    },
    {
      label: "Hauts-de-France",
      code: "32"
    },
    {
      label: "Grand Est",
      code: "44"
    },
    {
      label: "Pays de la Loire",
      code: "52"
    },
    {
      label: "Bretagne",
      code: "53"
    },
    {
      label: "Nouvelle-Aquitaine",
      code: "75"
    },
    {
      label: "Occitanie",
      code: "76"
    },
    {
      label: "Auvergne-Rhône-Alpes",
      code: "84"
    },
    {
      label: "Provence-Alpes-Côte d'Azur",
      code: "93"
    },
    {
      label: "Corse",
      code: "94"
    },
    {
      label: "Guadeloupe",
      code: "01"
    },
    {
      label: "Martinique",
      code: "02"
    },
    {
      label: "Guyane",
      code: "03"
    },
    {
      label: "La Réunion",
      code: "04"
    },
    {
      label: "Mayotte",
      code: "06"
    }
  ];

  await Promise.all(regions.map(async (region) => {
    await prisma.region.upsert({
          where: { code: region.code },
          update: {},
          create: {
            label: region.label,
            code: region.code,
          }
        });
  }));


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })
