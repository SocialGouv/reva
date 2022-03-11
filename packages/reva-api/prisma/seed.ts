import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.certification.upsert({
    where: { rncpId: '25467' },
    update: {},
    create: {
      label: `Diplôme d'État d'accompagnant éducatif et social`,
      slug: `de-diplome-d-etat-d-accompagnant-educatif-et-social`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '25467',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '13905' },
    update: {},
    create: {
      label: `Services aux personnes et aux territoires`,
      slug: `bac-pro-services-aux-personnes-et-aux-territoires`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '13905',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '32004' },
    update: {},
    create: {
      label: `Technicien d'équipement d'aide à la personne`,
      slug: `tp-technicien-d-equipement-d-aide-a-la-personne`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '32004',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '34690' },
    update: {},
    create: {
      label: `Assistant de vie dépendance`,
      slug: `diplome-assistant-de-vie-dependance`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '34690',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '34692' },
    update: {},
    create: {
      label: `Employé familial`,
      slug: `diplome-employe-familial`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '34692',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '17163' },
    update: {},
    create: {
      label: `Conducteur-e accompagnateur-e de personnes à mobilité réduite`,
      slug: `diplome-conducteur-e-accompagnateur-e-de-personnes-a-mobilite-reduite`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '17163',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '5983' },
    update: {},
    create: {
      label: `Surveillant - visiteur de nuit en secteur social et médico-social`,
      slug: `diplome-surveillant-visiteur-de-nuit-en-secteur-social-et-medico-social`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '5983',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '35028' },
    update: {},
    create: {
      label: `Agent de service médico-social`,
      slug: `tp-agent-de-service-medico-social`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '35028',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '16197' },
    update: {},
    create: {
      label: `Responsable de secteur - services à la personne`,
      slug: `diplome-responsable-de-secteur-services-a-la-personne`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '16197',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '35506' },
    update: {},
    create: {
      label: `Assistant de vie aux familles`,
      slug: `tp-assistant-de-vie-aux-familles`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '35506',
      isActive: true
    }
  });
  
  await prisma.certification.upsert({
    where: { rncpId: '35830' },
    update: {},
    create: {
      label: `Aide-Soignant`,
      slug: `de-aide-soignant`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality.`,
      rncpId: '35830',
      isActive: true
    }
  });

  await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW certification_search;
  `;

  await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW profession_search;
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
