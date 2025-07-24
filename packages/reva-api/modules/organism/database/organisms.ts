import { OrganismModaliteAccompagnement } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

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
  typology: OrganismTypology;
  ccnIds?: string[];
  degreeIds?: string[];
  qualiopiCertificateExpiresAt: Date;
  llToEarth: string | null;
  isOnSite?: boolean;
  modaliteAccompagnement: OrganismModaliteAccompagnement;
  modaliteAccompagnementRenseigneeEtValide: boolean;
}) => {
  const { degreeIds, ccnIds, ...otherData } = data;
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
