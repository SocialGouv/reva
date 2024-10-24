import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { prismaClient } from "../../prisma/client";
import { getCertificationById } from "./features/getCertificationById";
import { getCertificationCompetencesByBlocId } from "./features/getCertificationCompetencesByBlocId";
import { getCompetenceBlocsByCertificationId } from "./features/getCompetenceBlocsByCertificationId";
import { getConventionsCollectivesByCertificationId } from "./features/getConventionsCollectivesByCertificationId";
import { getDegreeByLevel } from "./features/getDegreeByLevel";
import { getDegrees } from "./features/getDegrees";
import { getDepartments } from "./features/getDepartments";
import { getDomainesByCertificationId } from "./features/getDomainesByCertificationId";
import { getDropOutReasons } from "./features/getDropOutReasons";
import { getGoals } from "./features/getGoals";
import { getRegionById } from "./features/getRegionById";
import { getRegions } from "./features/getRegions";
import { getReorientationReasons } from "./features/getReorientationReasons";
import { getTypeDiplomeById } from "./features/getTypeDiplomeById";
import { getTypeDiplomes } from "./features/getTypeDiplomes";
import { getVulnerabilityIndicators } from "./features/getVulnerabilityIndicators";
import { replaceCertification } from "./features/replaceCertification";
import { searchCertificationsForAdmin } from "./features/searchCertificationsForAdmin";
import { updateCertification } from "./features/updateCertification";
import { updateCompetenceBlocsByCertificationId } from "./features/updateCompetenceBlocsByCertificationId";
import { referentialResolversSecurityMap } from "./referential.security";
import {
  CertificationStatus,
  UpdateCertificationInput,
  UpdateCompetenceBlocsInput,
} from "./referential.types";
import { RNCPReferential } from "./rncp";
import {
  findEtablissement,
  findEtablissementDiffusible,
  findKbis,
  findQualiopiStatus,
} from "./features/entreprise";
import { searchCertificationsForCandidate } from "./features/searchCertificationsForCandidate";
import { getAvailableFormacodes } from "./features/getFormacodes";
import { getActiveCertifications } from "./features/getActiveCertifications";
import { getCandidacyFinancingMethods } from "./features/getCandidacyFinancingMethods";

const unsafeReferentialResolvers = {
  Certification: {
    codeRncp: ({ rncpId, codeRncp }: { rncpId: string; codeRncp: string }) =>
      codeRncp || rncpId,
    typeDiplome: ({ typeDiplomeId }: { typeDiplomeId: string }) =>
      getTypeDiplomeById({ typeDiplomeId }),
    degree: ({ level }: { level: number }) => getDegreeByLevel({ level }),
    domaines: ({ id: certificationId }: { id: string }) =>
      getDomainesByCertificationId({ certificationId }),
    conventionsCollectives: ({ id: certificationId }: { id: string }) =>
      getConventionsCollectivesByCertificationId({ certificationId }),
    competenceBlocs: ({
      id: certificationId,
      rncpId,
    }: {
      id: string;
      rncpId: string;
    }) => getCompetenceBlocsByCertificationId({ certificationId, rncpId }),
  },
  CertificationCompetenceBloc: {
    competences: ({ id: certificationCompetenceBlocId }: { id: string }) =>
      getCertificationCompetencesByBlocId({ certificationCompetenceBlocId }),
  },
  Department: {
    region: ({ regionId }: { regionId: string }) =>
      getRegionById({ id: regionId }),
  },
  EtablissementDiffusible: {
    qualiopiStatus: ({ siret }: { siret: string }) =>
      findQualiopiStatus({ siret }),
  },
  Etablissement: {
    qualiopiStatus: ({ siret }: { siret: string }) =>
      findQualiopiStatus({ siret }),
    kbis: ({ siret }: { siret: string }) => findKbis({ siret }),
  },
  Query: {
    getReferential: async (_: any, _payload: any) => {
      const goals = await getGoals();

      return {
        goals: goals,
      };
    },
    searchCertificationsForCandidate: async (
      _: any,
      payload: {
        offset?: number;
        limit?: number;
        organismId?: string;
        searchText?: string;
        status: CertificationStatus;
      },
    ) => searchCertificationsForCandidate(payload),
    searchCertificationsForAdmin: (_: any, payload: any) =>
      searchCertificationsForAdmin({
        offset: payload.offset,
        limit: payload.limit,
        searchText: payload.searchText,
        status: payload.status,
      }),
    getCertification: (
      _: unknown,
      { certificationId }: { certificationId: string },
    ) => getCertificationById({ certificationId }),
    getRegions,
    getDepartments,
    getDegrees,
    getVulnerabilityIndicators,
    getDropOutReasons,
    getReorientationReasons,
    getDomaines: () => prismaClient.domaine.findMany(),
    getConventionCollectives: () =>
      prismaClient.conventionCollective.findMany(),
    getTypeDiplomes,
    getFCCertification: (_: unknown, { rncp }: { rncp: string }) =>
      RNCPReferential.getInstance().findOneByRncp(rncp),
    getCountries: () => prismaClient.country.findMany(),
    getEtablissement: (_: unknown, { siret }: { siret: string }) =>
      findEtablissementDiffusible({ siret }),
    getEtablissementAsAdmin: (_: unknown, { siret }: { siret: string }) =>
      findEtablissement({ siret }),
    getFormacodes: () => getAvailableFormacodes(),
    getActiveCertifications: (
      _: any,
      payload: {
        filters?: {
          domaines?: string[];
          branches?: string[];
          levels?: number[];
        };
      },
    ) => getActiveCertifications(payload.filters),
    getCandidacyFinancingMethods,
  },
  Mutation: {
    referential_updateCertification: (
      _parent: unknown,
      { input }: { input: UpdateCertificationInput },
    ) => updateCertification({ updateCertificationInput: input }),
    referential_replaceCertification: (
      _parent: unknown,
      { input }: { input: UpdateCertificationInput },
    ) => replaceCertification({ replaceCertificationInput: input }),
    referential_updateCompetenceBlocsByCertificationId: (
      _parent: unknown,
      { input }: { input: UpdateCompetenceBlocsInput },
    ) => updateCompetenceBlocsByCertificationId(input),
  },
};

export const referentialResolvers = composeResolvers(
  unsafeReferentialResolvers,
  referentialResolversSecurityMap,
);
