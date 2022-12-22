import { CandidacyStatus } from "@prisma/client";
import { Either, Left, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { toSingleDropOutReason } from "./candidacies";
import { prismaClient } from "./client";
import { toDomainExperiences } from "./experiences";

export const getDropOutReasons = async (): Promise<
  Either<string, domain.DropOutReason[]>
> => {
  try {
    const dropOutReasons = await prismaClient.dropOutReason.findMany();

    return Right(dropOutReasons);
  } catch (e) {
    return Left(`error while retrieving drop out reasons`);
  }
};

export const existsDropOutReason = async ({
  dropOutReasonId,
}: {
  dropOutReasonId: string;
}): Promise<Either<string, boolean>> => {
  try {
    const dropOutReason = await prismaClient.dropOutReason.findUnique({
      where: { id: dropOutReasonId },
    });
    return Right(Boolean(dropOutReason));
  } catch (e) {
    return Left(`error while retrieving drop out reasons`);
  }
};

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  dropOutDate: string;
  otherReasonContent?: string;
}

export const dropOutCandidacy = async ({
  candidacyId,
  dropOutDate,
  dropOutReasonId,
  otherReasonContent,
}: DropOutCandidacyParams): Promise<Either<string, domain.Candidacy>> => {
  let candidacyStatus: CandidacyStatus;

  try {
    const candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        candidacyStatuses: true,
      },
    });
    if (candidacy === null) {
      return Left(`could not find candidacy ${candidacyId}`);
    }
    candidacyStatus = candidacy.candidacyStatuses[0].status;
  } catch (e) {
    return Left(`error while getting candidacy`);
  }

  try {
    const [, , newCandidacy] = await prismaClient.$transaction([
      prismaClient.dropOutReasonOnCandidacies.create({
        data: {
          candidacyId,
          dropOutDate: dropOutDate ?? "",
          status: candidacyStatus,
          dropOutReasonId,
          otherReasonContent,
        },
      }),
      prismaClient.candidaciesStatus.updateMany({
        where: {
          candidacyId: candidacyId,
        },
        data: {
          isActive: false,
        },
      }),
      prismaClient.candidacy.update({
        where: {
          id: candidacyId,
        },
        data: {
          candidacyStatuses: {
            create: {
              status: CandidacyStatus.ABANDON,
              isActive: true,
            },
          },
        },
        include: {
          dropOutReason: true,
          candidacyStatuses: true,
          department: true,
          experiences: true,
          goals: true,
        },
      }),
    ]);
    return Right({
      ...newCandidacy,
      experiences: toDomainExperiences(newCandidacy.experiences),
      dropOutReason: toSingleDropOutReason(newCandidacy.dropOutReason),
    });
  } catch (e: any) {
    return Left(
      `error while creating dropping out candidacy ${candidacyId}: ${e.message}`
    );
  }
};
