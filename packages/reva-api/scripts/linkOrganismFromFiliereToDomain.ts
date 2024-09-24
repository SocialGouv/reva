import { prismaClient } from "../prisma/client";

// 43062959-9315-4c1b-82b6-fdb9af494b0c	Social	SO
// b4e5cde7-4e2e-46bb-bbee-b3b92f8b6e3b	Santé	SA
// IDs are the same on both staging and prod.

const linkOrganismFromFiliereToDomain = async () => {
  // Social
  const formacode420 = await prismaClient.formacode.findUnique({
    where: { code: "420" },
  });
  const formacode445 = await prismaClient.formacode.findUnique({
    where: { code: "445" },
  });
  const formacode440 = await prismaClient.formacode.findUnique({
    where: { code: "440" },
  });

  const organismsSocial = await prismaClient.organism.findMany({
    where: {
      organismOnDomaine: {
        some: {
          domaineId: "43062959-9315-4c1b-82b6-fdb9af494b0c",
        },
      },
    },
  });

  for (const organism of organismsSocial) {
    await prismaClient.organismOnFormacode.deleteMany({
      where: {
        OR: [
          { organismId: organism.id, formacodeId: formacode420!.id },
          { organismId: organism.id, formacodeId: formacode445!.id },
          { organismId: organism.id, formacodeId: formacode440!.id },
        ],
      },
    });
    await prismaClient.organismOnFormacode.createMany({
      data: [
        { organismId: organism.id, formacodeId: formacode420!.id },
        { organismId: organism.id, formacodeId: formacode445!.id },
        { organismId: organism.id, formacodeId: formacode440!.id },
      ],
    });
  }

  // Sante
  const formacode434 = await prismaClient.formacode.findUnique({
    where: { code: "434" },
  });

  const organismsSante = await prismaClient.organism.findMany({
    where: {
      organismOnDomaine: {
        some: {
          domaineId: "b4e5cde7-4e2e-46bb-bbee-b3b92f8b6e3b",
        },
      },
    },
  });

  for (const organism of organismsSante) {
    await prismaClient.organismOnFormacode.deleteMany({
      where: {
        OR: [{ organismId: organism.id, formacodeId: formacode434!.id }],
      },
    });
    await prismaClient.organismOnFormacode.createMany({
      data: [{ organismId: organism.id, formacodeId: formacode434!.id }],
    });
  }
};

const main = async () => {
  try {
    await linkOrganismFromFiliereToDomain();
  } catch (error) {
    console.error(error);
  }
};

main();
