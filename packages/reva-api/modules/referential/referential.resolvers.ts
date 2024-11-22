import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { prismaClient } from "../../prisma/client";
import { getCertificationById } from "./features/getCertificationById";
import { getCertificationCompetencesByBlocId } from "./features/getCertificationCompetencesByBlocId";
import { getCompetenceBlocsByCertificationId } from "./features/getCompetenceBlocsByCertificationId";
import { getConventionsCollectivesByCertificationId } from "./features/getConventionsCollectivesByCertificationId";
import { getDegreeByLevel } from "./features/getDegreeByLevel";
import { getDegrees } from "./features/getDegrees";
import { getDepartments } from "./features/getDepartments";
import { getDropOutReasons } from "./features/getDropOutReasons";
import { getGoals } from "./features/getGoals";
import { getRegionById } from "./features/getRegionById";
import { getRegions } from "./features/getRegions";
import { getReorientationReasons } from "./features/getReorientationReasons";
import { getVulnerabilityIndicators } from "./features/getVulnerabilityIndicators";
import { replaceCertification } from "./features/replaceCertification";
import { searchCertificationsForAdmin } from "./features/searchCertificationsForAdmin";
import { updateCertification } from "./features/updateCertification";
import { updateCompetenceBlocsByCertificationId } from "./features/updateCompetenceBlocsByCertificationId";
import { referentialResolversSecurityMap } from "./referential.security";
import {
  CreateCompetenceBlocInput,
  CertificationStatus,
  UpdateCertificationInput,
  UpdateCompetenceBlocInput,
  UpdateCompetenceBlocsInput,
  UpdateCertificationStructureInput,
} from "./referential.types";
import { RNCPCertification, RNCPReferential } from "./rncp";
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
import { getCertificationCompetenceBlocById } from "./features/getCertificationCompetenceBlocById";
import { updateCertificationCompetenceBloc } from "./features/updateCertificationCompetenceBloc";
import { addCertification } from "./features/addCertification";
import { deleteCertificationCompetenceBloc } from "./features/deleteCertificationCompetenceBloc";
import { isFeatureActiveForUser } from "../feature-flipping/feature-flipping.features";
import { getCompetenceBlocsByCertificationIdV2 } from "./features/getCompetenceBlocsByCertificationIdV2";
import { getDomainsByCertificationId } from "./features/getDomainsByCertificationId";
import { getDomainsByFormacodes } from "./features/getDomainsByFormacodes";
import { createCertificationCompetenceBloc } from "./features/createCertificationCompetenceBloc";
import { updateCertificationStructureInput } from "./features/updateCertificationStructureInput";

const unsafeReferentialResolvers = {
  Certification: {
    codeRncp: ({ rncpId, codeRncp }: { rncpId: string; codeRncp: string }) =>
      codeRncp || rncpId,
    typeDiplome: ({ rncpTypeDiplome }: { rncpTypeDiplome: string }) =>
      rncpTypeDiplome,
    degree: ({ level }: { level: number }) => getDegreeByLevel({ level }),
    conventionsCollectives: ({ id: certificationId }: { id: string }) =>
      getConventionsCollectivesByCertificationId({ certificationId }),
    competenceBlocs: async (
      {
        id: certificationId,
        rncpId,
      }: {
        id: string;
        rncpId: string;
      },
      _payload: unknown,
      { auth: { userInfo } }: GraphqlContext,
    ) =>
      (await isFeatureActiveForUser({
        feature: "ANNUAIRE_CERTIFICATIONS_V2",
        userKeycloakId: userInfo?.sub,
      }))
        ? getCompetenceBlocsByCertificationIdV2({ certificationId })
        : getCompetenceBlocsByCertificationId({ certificationId, rncpId }),
    domains: ({ id: certificationId }: { id: string }) =>
      getDomainsByCertificationId({ certificationId }),
  },
  FCCertification: {
    DOMAINS: ({
      FORMACODES,
    }: {
      FORMACODES: RNCPCertification["FORMACODES"];
    }) => getDomainsByFormacodes({ FORMACODES }),
  },
  CertificationCompetenceBloc: {
    competences: ({ id: certificationCompetenceBlocId }: { id: string }) =>
      getCertificationCompetencesByBlocId({ certificationCompetenceBlocId }),
    certification: ({ certificationId }: { certificationId: string }) =>
      getCertificationById({ certificationId }),
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
    getConventionCollectives: () =>
      prismaClient.conventionCollective.findMany(),
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
    getCertificationCompetenceBloc: (
      _: unknown,
      {
        certificationCompetenceBlocId,
      }: {
        certificationCompetenceBlocId: string;
      },
    ) => getCertificationCompetenceBlocById({ certificationCompetenceBlocId }),
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
    referential_createCertificationCompetenceBloc: (
      _parent: unknown,
      { input }: { input: CreateCompetenceBlocInput },
    ) => createCertificationCompetenceBloc(input),
    referential_updateCertificationCompetenceBloc: (
      _parent: unknown,
      { input }: { input: UpdateCompetenceBlocInput },
    ) => updateCertificationCompetenceBloc(input),
    referential_deleteCertificationCompetenceBloc: (
      _parent: unknown,
      {
        certificationCompetenceBlocId,
      }: { certificationCompetenceBlocId: string },
    ) => deleteCertificationCompetenceBloc({ certificationCompetenceBlocId }),
    referential_addCertification: (
      _parent: unknown,
      { input }: { input: { codeRncp: string } },
    ) => addCertification(input),
    referential_updateCertificationStructure: (
      _parent: unknown,
      { input }: { input: UpdateCertificationStructureInput },
    ) => updateCertificationStructureInput(input),
  },
};

export const referentialResolvers = composeResolvers(
  unsafeReferentialResolvers,
  referentialResolversSecurityMap,
);
