import { prismaClient } from "../../prisma/client";
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
import { searchCertifications } from "./features/searchCertifications";

export const referentialResolvers = {
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
  },
  Department: {
    region: ({ regionId }: { regionId: string }) =>
      getRegionById({ id: regionId }),
  },
  Query: {
    // eslint-disable-next-line
    // @ts-ignore
    getReferential: async (_: any, _payload: any) => {
      const goals = await getGoals();

      return {
        goals: goals,
      };
    },
    getCertifications: (_: any, payload: any) =>
      searchCertifications({
        offset: payload.offset,
        limit: payload.limit,
        departmentId: payload.departmentId,
        organismId: payload.organismId,
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
  },
};
