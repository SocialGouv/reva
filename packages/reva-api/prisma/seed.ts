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
            isActive: true,
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
    where: { rncpId: '35506' },
    data: {
      summary: `L'assistant(e)  de  vie  aux  familles  (ADVF) contribue au bien être des personnes au sein de leur foyer en respectant leur dignité, leur intégrité, leur vie privée et leur sécurité. Pour permettre aux  personnes âgées ou malades, aux personnes en situation de handicap de maintenir leur autonomie et de continuer à vivre à domicile,  l'ADVF  les  aide  en  mettant  en  œuvre  les  gestes  et  techniques  appropriés  dans  le  respect  de l'intimité et l'écoute de la personne.`
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35028' },
    data: {
      summary: `L'emploi s'exerce sous la hiérarchie du responsable hôtelier, au sein d'une équipe pluriprofessionnelle. Selon les compétences mises en œuvre, l'emploi s'exerce sous la responsabilité partagée du responsable hôtelier et du responsable soignant.`
    }
  });


  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '5983' },
    data: {
      summary: `Le surveillant - visiteur de nuit  exerce principalement au sein de  structures d'hébergement collectif accueillant des personnes âgées, des  personnes handicapées (adultes ou enfants), des personnes en situation  de précarité, des enfants en difficulté sociale et familiale.`
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '25085' },
    data: {
      summary: `Le titulaire du diplôme est un employé qualifié de niveau V, qui assure des activités de services aux personnes, qui se définissent comme l'ensemble des activités contribuant au mieux-être des personnes.`
    }
  });

  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '13905' },
    data: {
      summary: `Le titulaire de ce diplôme offre des services de proximité aux personnes et aux territoires : services à destination des populations, services aux collectivités et aux entreprises ; services qui contribuent à l'attractivité et à la cohésion des territoires ruraux (services sociaux, prestations liées aux transports, aux loisirs, aux activités culturelles et sportives, au tourisme).`
    }
  });
  
  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '17163' },
    data: {
      summary: `Le conducteur accompagnateur accompagne les personnes à mobilité réduite du fait d'un handicap physique, mental, sensoriel ou intellectuel ou d'une forme de dépendance quelle qu'elle soit qui rend impossibles les déplacements sans accompagnement.`
    }
  });
  
  // TODO: REVIEW DESCRIPTION
  await prisma.certification.update({
    where: { rncpId: '34691' },
    data: {
      summary: `L'Assistant maternel ou le Garde d'enfants prend en charge des enfants de la naissance à l'adolescence. Le mode de garde d'enfants chez un assistant maternel ou chez le particulier employeur est en France le premier mode de garde des enfants de moins de 3 ans, en dehors des gardes par la famille.`
    }
  });

  
  await prisma.certification.update({
    where: { rncpId: '34692' },
    data: {
      summary: `L'employé familial intervient au domicile des particuliers (en leur présence ou non) principalement pour l'entretien du cadre de vie, du linge et la préparation des repas. Il est amené à se déplacer aux différents domiciles des particuliers employeurs.`
    }
  });
  
  await prisma.certification.update({
    where: { rncpId: '34690' },
    data: {
      summary: `La mission de l'assistant de vie dépendance est d'accompagner des personnes dont l'autonomie est altérée dans la réalisation de leurs activités, pouvant aller des tâches courantes aux actes essentiels de la vie quotidienne.`
    }
  });
  
  await prisma.certification.update({
    where: { rncpId: '34827' },
    data: {
      summary: `L'éducateur de jeunes enfants est un professionnel du travail social et de l'éducation. Il exerce dans le cadre d'un mandat et de missions institutionnelles. Il accompagne des jeunes enfants, dans une démarche éducative et sociale globale en lien avec leur famille.`
    }
  });
  
  await prisma.certification.update({
    where: { rncpId: '35830' },
    data: {
      summary: `La certification mise en place par l'arrêté du 10 juin 2021 vise à répondre aux évolutions du  rôle de l'aide soignant. En tant que professionnel de santé, l'aide-soignant est habilité à dispenser des soins de la vie quotidienne ou des soins aigus pour préserver et restaurer la continuité de la vie.`
    }
  });

  await prisma.certification.update({
    where: { rncpId: '35832' },
    data: {
      summary: `L'auxiliaire de puériculture réalise des activités d'éveil et des soins adaptés à l'évolution de l'état clinique visant au bien-être, à l'autonomie et au développement de l'enfant.`
    }
  });

  await prisma.certification.update({
    where: { rncpId: '4503' },
    data: {
      summary: `Le technicien de l'intervention sociale et familiale effectue une intervention sociale préventive, éducative et réparatrice visant à favoriser l'autonomie des personnes et leur intégration dans leur environnement et à créer ou restaurer le lien social.`
    }
  });

  await prisma.certification.update({
    where: { rncpId: '2514' },
    data: {
      summary: `Le certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale atteste des compétences nécessaires pour animer une unité de travail dans le champ de l'intervention sociale et conduire son action dans le cadre du projet et des missions de l'employeur, ainsi que dans le cadre des politiques publiques.`
    }
  });

  // await prisma.certification.update({
  //   where: { rncpId: '35993' },
  //   data: {
  //     summary: `Le responsable - coordonnateur services au domicile (RCSAD) assure l'interface entre les clients, les intervenants et la structure de services au domicile. Les activités du RCSAD varient en fonction de l'organisation de la structure, de la répartition des activités et des différents niveaux hiérarchiques.`
  //   }
  // });

  // await prisma.certification.update({
  //   where: { rncpId: '36004' },
  //   data: {
  //     summary: `L'accompagnant éducatif et social réalise des interventions sociales au quotidien visant à accompagner la personne en situation de handicap ou touchée par un manque d'autonomie quelles qu'en soient l'origine ou la nature.`
  //   }
  // });

  // await prisma.certification.update({
  //   where: { rncpId: '35506' },
  //   data: {
  //     summary: ``
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

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })
