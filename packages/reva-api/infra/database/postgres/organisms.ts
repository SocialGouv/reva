import { Prisma } from "@prisma/client";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { DepartmentWithOrganismMethods } from "../../../domain/types/candidacy";
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

export const getOrganismBySiretOrLabelAndTypology = async (
  siret: string,
  label: string,
  typology: OrganismTypology
): Promise<Either<string, Maybe<domain.Organism>>> => {
  try {
    const organism = await prismaClient.organism.findFirst({
      where: {
        OR: [
          {
            siret,
            typology,
          },
          {
            label,
            typology,
          },
        ],
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
  siret: string;
  isActive: boolean;
  typology: OrganismTypology;
  ccnIds?: string[];
  domaineIds?: string[];
  departmentsWithOrganismMethods: DepartmentWithOrganismMethods[];
}): Promise<Either<string, domain.Organism>> => {
  try {
    const { domaineIds, ccnIds, departmentsWithOrganismMethods, ...otherData } =
      data;
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
        departmentsWithOrganismMethods: {
          createMany: {
            data: departmentsWithOrganismMethods?.map((d) => ({
              departmentId: d.departmentId,
              isOnSite: d.isOnSite,
              isRemote: d.isRemote,
            })),
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
  searchText,
}: {
  certificationId: string;
  departmentId: string;
  searchText?: string;
}): Promise<Either<string, domain.Organism[]>> => {
  try {
    if (!certificationId || !departmentId) {
      return Right([]);
    }
    const whereClauseArray: object[] = [{ certificationId }, { departmentId }];
    if (searchText) {
      whereClauseArray.push({
        organism: { label: { contains: searchText, mode: "insensitive" } },
      });
    }
    return Right(
      await prismaClient.organism.findMany({
        where: {
          activeOrganismsByAvailableCertificationsAndDepartments: {
            some: { AND: whereClauseArray },
          },
        },
      })
    );
  } catch (e) {
    logger.error(e);
    return Left(`error while retreiving organism`);
  }
};

export const getReferentOrganismFromCandidacyId = async (
  candidacyId: string
) => {
  try {
    const candidacy = await prismaClient.candidacy.findUnique({
      where: { id: candidacyId },
      include: { organism: true },
    });
    // return Right(candidacy?.organism);
    return Right(Maybe.fromNullable(candidacy?.organism));
  } catch (e) {
    logger.error(e);
    return Left(
      `Error while retreiving referent organism from candidacy ${candidacyId}: ${e}`
    );
  }
};

export const existOrganismWithTypologyAndSiret = async ({
  typology,
  siret,
}: Pick<Prisma.OrganismWhereInput, "siret" | "typology">) => {
  try {
    const matchCount = await prismaClient.organism.count({
      where: { siret, typology: typology as OrganismTypology },
    });
    return Right(matchCount > 0);
  } catch (e) {
    logger.error(e);
    return Left(`Error while counting organisms matching criteria`);
  }
};
