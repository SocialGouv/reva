import { Prisma } from "@prisma/client";
import { Either, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { logger } from "../../logger";
import { prismaClient } from "./client";

export const getAAPOrganisms = async (params: {
  candidacyId: string;
}): Promise<Either<string, domain.Organism[]>> => {
  return getOrganisms({ candidacyId: params.candidacyId, isArchitect: true });
};

export const getOrganismById = async (
  organismId: string
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

export const getCompanionOrganisms = async (params: {
  candidacyId: string;
}): Promise<Either<string, domain.Organism[]>> => {
  return getOrganisms({ candidacyId: params.candidacyId, isCompanion: true });
};

const getOrganisms = async (params: {
  candidacyId: string;
  isArchitect?: boolean;
  isCompanion?: boolean;
}) => {
  try {
    const candidacy = await prismaClient.candidacy.findFirst({
      where: {
        id: params.candidacyId,
        certificationsAndRegions: { some: {} },
      },
      include: {
        certificationsAndRegions: {
          where: {
            isActive: true,
          },
          select: {
            certificationId: true,
            regionId: true,
          },
        },
      },
    });

    if (!candidacy) {
      return Right([]);
    }

    let filters = {
      certificationId: candidacy.certificationsAndRegions[0].certificationId,
      regionId: candidacy.certificationsAndRegions[0].regionId,
    } as Prisma.OrganismsOnRegionsAndCertificationsWhereInput;

    if (params.isArchitect !== undefined) {
      filters = { ...filters, isArchitect: params.isArchitect };
    }

    if (params.isCompanion !== undefined) {
      filters = { ...filters, isCompanion: params.isCompanion };
    }

    const organisms = await prismaClient.organism.findMany({
      where: {
        regionsAndCertifications: {
          some: filters,
        },
        isActive: true,
      },
    });

    return Right(organisms);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving organisms`);
  }
};

export const getOrganismBySiret = async (
  siret: string
): Promise<Either<string, Maybe<domain.Organism>>> => {
  try {
    const organism = await prismaClient.organism.findFirst({
      where: {
        siret,
      },
    });
    return Right(Maybe.fromNullable(organism));
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving organism`);
  }
};

export const createOrganism = async (data: {
  label: string;
  address: string;
  zip: string;
  city: string;
  contactAdministrativeEmail: string;
  contactCommercialName: string;
  contactCommercialEmail: string;
  siret: string;
  isActive: boolean;
  typology: OrganismTypology;
  domaineIds?: string[];
}): Promise<Either<string, domain.Organism>> => {
  try {
    const { domaineIds, ...otherData } = data;
    const organism = await prismaClient.organism.create({
      data: {
        ...otherData,
        organismOnDomaine: {
          createMany: {
            data:
              domaineIds?.map((domaineId) => ({
                domaineId,
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

export const getActiveOrganismForCertificationAndDepartment = async ({
  certificationId,
  departmentId,
}: {
  certificationId: string;
  departmentId: string;
}): Promise<Either<string, domain.Organism[]>> => {
  try {
    logger.info({ certificationId, departmentId });

    return Right(
      await prismaClient.organism.findMany({
        where: {
          activeOrganismsByAvailableCertificationsAndDepartments: {
            some: { AND: [{ certificationId }, { departmentId }] },
          },
        },
      })
    );
  } catch (e) {
    logger.error(e);
    return Left(`error while retreiving organism`);
  }
};
