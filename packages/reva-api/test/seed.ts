import { prismaClient } from "../infra/database/postgres/client";
import {
  adminAccount1,
  archiIperia1,
  archiIperia2,
  candidateJPL,
  candidateMPB,
  organismIperia,
} from "./fixtures/people-organisms";

export async function seed() {
  // Organisms
  await prismaClient.organism.createMany({
    data: [organismIperia],
  });

  // Accounts
  await prismaClient.account.createMany({
    data: [archiIperia1, archiIperia2, adminAccount1],
  });

  // Candidates
  await prismaClient.candidate.createMany({
    data: [candidateJPL, candidateMPB],
  });

}
