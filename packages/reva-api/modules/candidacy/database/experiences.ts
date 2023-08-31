import { Experience } from "@prisma/client";
import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import * as domain from "../candidacy.types";

export const toDomainExperiences = (
  experiences: Experience[]
): domain.Experience[] => {
  return experiences.map((xp) => {
    return {
      id: xp.id,
      title: xp.title,
      startedAt: xp.startedAt,
      duration: xp.duration,
      description: xp.description,
    };
  });
};

export const getExperienceFromId = async (id: string) => {
  try {
    const candidacy = await prismaClient.experience.findUnique({
      where: {
        id,
      },
    });

    return Maybe.fromNullable(candidacy).toEither(
      `Experience with id ${id} not found`
    );
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving the experience with id ${id}`);
  }
};

export const insertExperience = async (params: {
  candidacyId: string;
  experience: domain.ExperienceInput;
}): Promise<Either<string, domain.Experience>> => {
  try {
    const newExperience = await prismaClient.experience.create({
      data: {
        title: params.experience.title,
        duration: params.experience.duration,
        description: params.experience.description,
        startedAt: params.experience.startedAt,
        candidacy: {
          connect: {
            id: params.candidacyId,
          },
        },
      },
    });

    return Right({
      id: newExperience.id,
      candidacyId: newExperience.candidacyId,
      title: newExperience.title,
      duration: newExperience.duration,
      description: newExperience.description,
      startedAt: newExperience.startedAt,
    });
  } catch (e) {
    logger.error(e);
    return Left("error while creating experience");
  }
};

export const updateExperience = async (params: {
  candidacyId: string;
  experienceId: string;
  experience: domain.ExperienceInput;
}): Promise<Either<string, domain.Experience>> => {
  try {
    const newExperience = await prismaClient.experience.update({
      where: {
        id: params.experienceId,
      },
      data: {
        title: params.experience.title,
        duration: params.experience.duration,
        description: params.experience.description,
        startedAt: params.experience.startedAt,
      },
    });

    return Right({
      id: newExperience.id,
      candidacyId: newExperience.candidacyId,
      title: newExperience.title,
      duration: newExperience.duration,
      description: newExperience.description,
      startedAt: newExperience.startedAt,
    });
  } catch (e) {
    logger.error(e);
    return Left("error while updating experience");
  }
};
