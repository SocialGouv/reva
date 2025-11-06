import {
  ConformiteNormeAccessibilite,
  OrganismModaliteAccompagnement,
} from "@prisma/client";

import { prismaClient } from "@/prisma/client";

type CreateOrganismInput =
  | {
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
      modaliteAccompagnementRenseigneeEtValide: false;
    }
  | {
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
      nomPublic: string;
      emailContact: string;
      telephone: string;
      siteInternet?: string | null;
      adresseNumeroEtNomDeRue?: string | null;
      adresseInformationsComplementaires?: string | null;
      adresseCodePostal?: string | null;
      adresseVille?: string | null;
      conformeNormesAccessibilite?: ConformiteNormeAccessibilite | null;
      modaliteAccompagnementRenseigneeEtValide: true;
    };

export const createOrganism = async (data: CreateOrganismInput) => {
  const { degreeIds, ccnIds, ...otherData } = data;

  if (
    otherData.modaliteAccompagnementRenseigneeEtValide === true &&
    (!otherData.emailContact || !otherData.nomPublic || !otherData.telephone)
  ) {
    throw new Error(
      "emailContact, nomPublic et telephone sont requis lorsque modaliteAccompagnementRenseigneeEtValide est à true",
    );
  }

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
