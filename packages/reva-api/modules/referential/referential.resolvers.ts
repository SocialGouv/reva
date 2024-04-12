import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { prismaClient } from "../../prisma/client";
import { getCertificationAuthorityTags } from "./features/getCertificationAuthorityTags";
import { getCertificationById } from "./features/getCertificationById";
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
import { searchCertificationsForCandidate } from "./features/searchCertificationsForCandidate";
import { updateCertification } from "./features/updateCertification";
import { referentialResolversSecurityMap } from "./referential.security";
import {
  UpdateCertificationInput,
  UpdateCompetenceBlocsInput,
} from "./referential.types";
import { RNCPReferential } from "./rncp";
import { getCompetenceBlocsByCertificationId } from "./features/getCompetenceBlocsByCertificationId";
import { updateCompetenceBlocsByCertificationId } from "./features/updateCompetenceBlocsByCertificationId";
import { getCertificationCompetencesByBlocId } from "./features/getCertificationCompetencesByBlocId";

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
  Query: {
    getReferential: async (_: any, _payload: any) => {
      const goals = await getGoals();

      return {
        goals: goals,
      };
    },
    searchCertificationsForCandidate: (_: any, payload: any) =>
      searchCertificationsForCandidate({
        offset: payload.offset,
        limit: payload.limit,
        departmentId: payload.departmentId,
        organismId: payload.organismId,
        searchText: payload.searchText,
        status: payload.status,
      }),
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
    getCertificationAuthorityTags,
    getFCCertification: (_: unknown, { rncp }: { rncp: string }) =>
      RNCPReferential.getInstance().findOneByRncp(rncp),
    getCountries: () => prismaClient.country.findMany(),
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
