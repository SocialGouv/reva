import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import { prismaClient } from "../../../prisma/client";
import { Candidate } from "../../candidate/candidate.types";
import {
  sendNewEmailCandidateEmail,
  sendPreviousEmailCandidateEmail,
} from "../candidacy.mails";

export const updateContactOfCandidacy = async (
  context: {
    hasRole: (role: string) => boolean;
    keycloakAdmin: KeycloakAdminClient;
    keycloakId: string;
  },
  params: {
    candidateId: string;
    candidateData: {
      firstname: string;
      lastname: string;
      phone: string;
      email: string;
    };
  }
): Promise<Candidate> => {
  const { candidateId, candidateData } = params;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

  if (context.keycloakId != candidateToUpdate?.keycloakId) {
    throw new Error("Utilisateur non autorisé");
  }

  if (!candidateToUpdate) {
    throw new Error(`Ce candidat n'existe pas`);
  }

  const candidateWithEmail = await prismaClient.candidate.findUnique({
    where: { email: candidateData.email },
  });

  if (candidateWithEmail && candidateWithEmail.id != candidateToUpdate.id) {
    throw new Error(
      `Vous ne pouvez pas utiliser ${candidateData.email} comme nouvelle adresse email`
    );
  }

  if (candidateData.email !== candidateToUpdate.email) {
    await sendPreviousEmailCandidateEmail(candidateToUpdate.email);
    await sendNewEmailCandidateEmail(candidateData.email);
  }

  if (process.env.KEYCLOAK_APP_REALM) {
    await context.keycloakAdmin.users.update(
      {
        id: context.keycloakId,
        realm: process.env.KEYCLOAK_APP_REALM,
      },
      {
        email: candidateData.email,
      }
    );
  }

  return prismaClient.candidate.update({
    where: { id: candidateId },
    data: candidateData,
  });
};
