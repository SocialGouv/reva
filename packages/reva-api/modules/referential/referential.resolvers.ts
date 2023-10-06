import { prismaClient } from "../../prisma/client";
import { getCertificationById } from "./features/getCertificationById";
import { getDegrees } from "./features/getDegrees";
import { getDepartments } from "./features/getDepartments";
import { getDropOutReasons } from "./features/getDropOutReasons";
import { getGoals } from "./features/getGoals";
import { getRegions } from "./features/getRegions";
import { getReorientationReasons } from "./features/getReorientationReasons";
import { getTypeDiplomeById } from "./features/getTypeDiplomeById";
import { getVulnerabilityIndicators } from "./features/getVulnerabilityIndicators";
import { searchCertifications } from "./features/searchCertifications";

export const referentialResolvers = {
  Certification: {
    codeRncp: ({ rncpId, codeRncp }: { rncpId: string; codeRncp: string }) =>
      codeRncp || rncpId,
    typeDiplome: ({ typeDiplomeId }: { typeDiplomeId: string }) =>
      getTypeDiplomeById({ typeDiplomeId }),
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
        searchText: payload.searchText,
      }),
    getCertification: (
      _: unknown,
      { certificationId }: { certificationId: string }
    ) => getCertificationById({ certificationId }),
    getRegions: (_: any, _payload: any) => getRegions(),
    getDepartments: (_: any, _payload: any) => getDepartments(),
    getDegrees: (_: any, _payload: any) => getDegrees(),
    getVulnerabilityIndicators: (_: any, _payload: any) =>
      getVulnerabilityIndicators(),
    getDropOutReasons: (_: any, _payload: any) => getDropOutReasons(),
    getReorientationReasons: (_: any, _payload: any) =>
      getReorientationReasons(),

    getDomaines: () => prismaClient.domaine.findMany(),
    getConventionCollectives: () =>
      prismaClient.conventionCollective.findMany(),
  },
};
