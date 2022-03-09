import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // const alice = await prisma.user.upsert({
  //   where: { email: 'alice@prisma.io' },
  //   update: {},
  //   create: {
  //     email: 'alice@prisma.io',
  //     name: 'Alice',
  //     posts: {
  //       create: {
  //         title: 'Check out Prisma with Next.js',
  //         content: 'https://www.prisma.io/nextjs',
  //         published: true,
  //       },
  //     },
  //   },
  // })

  // const bob = await prisma.user.upsert({
  //   where: { email: 'bob@prisma.io' },
  //   update: {},
  //   create: {
  //     email: 'bob@prisma.io',
  //     name: 'Bob',
  //     posts: {
  //       create: [
  //         {
  //           title: 'Follow Prisma on Twitter',
  //           content: 'https://twitter.com/prisma',
  //           published: true,
  //         },
  //         {
  //           title: 'Follow Nexus on Twitter',
  //           content: 'https://twitter.com/nexusgql',
  //           published: true,
  //         },
  //       ],
  //     },
  //   },
  // })

  const test = await prisma.certification.upsert({
    where: { rncpId: '25467'},
    update: {},
    create: {
      label: `Diplôme d'État d'accompagnant éducatif et social`,
      slug: `de-diplome-d-etat-d-accompagnant-educatif-et-social`,
      description: `Soul-delay lights semiotics jeans hacker apophenia otaku tank-traps shrine cyber-marketing voodoo god hotdog skyscraper Chiba. Shanty town hotdog physical weathered fetishism rebar cardboard order-flow render-farm. A.I. render-farm pistol dead fetishism fluidity advert grenade drone otaku tanto vehicle assault kanji. Marketing advert semiotics DIY narrative alcohol-ware dolphin nano-paranoid bridge silent beef noodles math-augmented reality. City pen math-youtube range-rover into disposable stimulate weathered shoes faded tube. Youtube alcohol cartel sign film shrine boat tanto Kowloon industrial grade monofilament network Legba denim narrative concrete. Computer hotdog cyber-girl motion kanji-ware singularity soul-delay range-rover film sensory military-grade tattoo urban. Legba-ware sensory computer lights bridge knife silent. Sub-orbital into nano-otaku woman skyscraper camera neural meta-semiotics post-fluidity wonton soup denim Kowloon city digital. `,
      rncpId: '25467',
      isActive: true
    }
  })

  console.log({ test })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
