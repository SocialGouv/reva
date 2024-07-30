import { prismaClient } from "../../../prisma/client";

export const getOrganismById = async (organismId: string) =>
  prismaClient.organism.findUnique({
    where: {
      id: organismId,
    },
  });

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
}) => {
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
  return organism;
};
