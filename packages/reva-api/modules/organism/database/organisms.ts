import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import * as domain from "../organism.types";

export const getOrganismById = async (
  organismId: string,
): Promise<Either<string, Maybe<domain.Organism>>> => {
  try {
    const organism = await prismaClient.organism.findFirst({
      where: {
        id: organismId,
      },
    });

    return Right(Maybe.fromNullable(organism));
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving organism ${organismId}`);
  }
};

export const createOrganism = async (data: {
  label: string;
  contactAdministrativeEmail: string;
  contactAdministrativePhone: string;
  website: string;
  legalStatus: LegalStatus;
  siret: string;
  isActive: boolean;
  typology: OrganismTypology;
  ccnIds?: string[];
  domaineIds?: string[];
  degreeIds?: string[];
  qualiopiCertificateExpiresAt: Date;
  llToEarth: string | null;
  isOnSite?: boolean;
  isHeadAgency?: boolean;
}): Promise<Either<string, domain.Organism>> => {
  try {
    const { domaineIds, degreeIds, ccnIds, ...otherData } = data;
    const organism = await prismaClient.organism.create({
      data: {
        ...otherData,
        organismOnConventionCollective: {
          createMany: {
            data:
              ccnIds?.map((ccnId) => ({
                ccnId,
              })) || [],
          },
        },
        organismOnDomaine: {
          createMany: {
            data:
              domaineIds?.map((domaineId) => ({
                domaineId,
              })) || [],
          },
        },
        managedDegrees: {
          createMany: {
            data:
              degreeIds?.map((degreeId) => ({
                degreeId,
              })) || [],
          },
        },
      },
    });
    return Right(organism);
  } catch (e) {
    logger.error(e);
    return Left(`error while creating organism`);
  }
};
