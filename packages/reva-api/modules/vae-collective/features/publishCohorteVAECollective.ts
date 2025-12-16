import randomstring from "randomstring";

import { prismaClient } from "@/prisma/client";
export const publishCohorteVAECollective = async ({
  cohorteVaeCollectiveId,
}: {
  cohorteVaeCollectiveId: string;
}) => {
  const cohorte = await prismaClient.cohorteVaeCollective.findUnique({
    where: {
      id: cohorteVaeCollectiveId,
    },
    include: {
      certificationCohorteVaeCollectives: true,
    },
  });

  if (!cohorte) {
    throw new Error("Cohorte not found");
  }

  if (cohorte.status !== "BROUILLON") {
    throw new Error(
      "Impossible de publier une cohorte si son statut n'est pas 'BROUILLON'",
    );
  }

  if (!cohorte.certificationCohorteVaeCollectives.length) {
    throw new Error(
      "Impossible de publier une cohorte si elle n'a pas de certification associée",
    );
  }

  if (!cohorte.organismId) {
    throw new Error(
      "Impossible de publier une cohorte si elle n'a pas d'aap associé",
    );
  }

  const codeInscription = await generateCodeInscription();

  return prismaClient.cohorteVaeCollective.update({
    where: {
      id: cohorteVaeCollectiveId,
    },
    data: {
      status: "PUBLIE",
      codeInscription,
    },
  });
};

//Tente de générer un code d'inscription unique (10 tentatives max)
const generateCodeInscription = async () => {
  let tentativeCode = "";
  let tentatives = 1;
  let codeIsUnique = false;
  while (tentatives <= 10 && !codeIsUnique) {
    tentativeCode = randomstring.generate({
      length: 8,
      charset: "ABCDEFGHJKMNPQRSTUVWXYZ23456789",
    });
    codeIsUnique = !(await prismaClient.cohorteVaeCollective.findUnique({
      where: { codeInscription: tentativeCode },
    }));
    tentatives++;
  }
  if (codeIsUnique) {
    return tentativeCode;
  } else {
    throw new Error(
      "Impossible de générer un code d'inscription unique après 10 tentatives",
    );
  }
};
