import { formatDuration, intervalToDuration } from "date-fns";

import { createAccount } from "@/modules/account/features/createAccount";
import { generateJwt } from "@/modules/shared/auth/jwt.helper";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";

export const createSousCompteVaeCollective = async ({
  commanditaireVaeCollectiveId,
  accountFirstname,
  accountLastname,
  accountEmail,
  canCreateCohorteVaeCollective,
  isAAPAccount,
}: {
  commanditaireVaeCollectiveId: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  canCreateCohorteVaeCollective: boolean;
  isAAPAccount: boolean;
}) => {
  const account = await createAccount({
    email: accountEmail,
    username: accountEmail,
    firstname: accountFirstname,
    lastname: accountLastname,
    group: "sous_compte_vae_collective",
    dontSendKeycloakEmail: true,
  });

  const commanditaireVaeCollective =
    await prismaClient.commanditaireVaeCollective.findUnique({
      where: {
        id: commanditaireVaeCollectiveId,
      },
      include: {
        gestionnaire: true,
      },
    });

  const sousCompteVaeCollective =
    await prismaClient.sousCompteVaeCollective.create({
      data: {
        commanditaireVaeCollectiveId: commanditaireVaeCollectiveId,
        accountId: account.id,
        isAAPAccount,
      },
    });

  if (canCreateCohorteVaeCollective) {
    await prismaClient.roleSpecificToSousCompteVaeCollective.create({
      data: {
        sousCompteVaeCollectiveId: sousCompteVaeCollective.id,
        role: "CREATEUR_COHORTE",
      },
    });
  }
  await sendSetupPasswordEmail({
    email: accountEmail,
    adminFirstName: commanditaireVaeCollective?.gestionnaire?.firstname ?? "",
    adminLastName: commanditaireVaeCollective?.gestionnaire?.lastname ?? "",
  });

  return sousCompteVaeCollective;
};

const sendSetupPasswordEmail = async ({
  email,
  adminFirstName,
  adminLastName,
}: {
  email: string;
  adminFirstName: string;
  adminLastName: string;
}) => {
  const TOKEN_EXPIRATION_IN_SECONDS = 4 * 24 * 60 * 60;
  const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";
  const token = generateJwt(
    { email, action: "reset-password" },
    TOKEN_EXPIRATION_IN_SECONDS,
  );
  const url = new URL(
    `/vae-collective/reset-password?resetPasswordToken=${token}`,
    baseUrl,
  );
  const resetPasswordUrl = new URL("/vae-collective/forgot-password", baseUrl);

  const tokenDuration = intervalToDuration({
    start: 0,
    end: TOKEN_EXPIRATION_IN_SECONDS * 1000,
  });
  const humanReadableTokenDuration = formatDuration(tokenDuration);

  await sendEmailUsingTemplate({
    to: { email },
    templateId: 732,
    params: {
      setupPasswordUrl: url.toString(),
      resetPasswordUrl: resetPasswordUrl.toString(),
      tokenDuration: humanReadableTokenDuration,
      adminFirstName,
      adminLastName,
    },
  });
};
