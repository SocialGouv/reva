import { prismaClient } from "../../../prisma/client";

export const getCandidateByKeycloakId = ({
  keycloakId,
}: {
  keycloakId: string;
}) => prismaClient.candidate.findUnique({ where: { keycloakId } });
