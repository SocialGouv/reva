import mercurius from "mercurius";

import { prismaClient } from "../../prisma/client";
import * as certificationsDb from "./database/certifications";
import { getCertifications } from "./features/getCertifications";
import { getDegrees } from "./features/getDegrees";
import { getDepartments } from "./features/getDepartments";
import { getDropOutReasons } from "./features/getDropOutReasons";
import { getGoals } from "./features/getGoals";
import { getRegions } from "./features/getRegions";
import { getReorientationReasons } from "./features/getReorientationReasons";
import { getVulnerabilityIndicators } from "./features/getVulnerabilityIndicators";

export const referentialResolvers = {
  Query: {
    // eslint-disable-next-line
    // @ts-ignore
    getReferential: async (_: any, _payload: any) => {
      const goals = await getGoals();

      return {
        goals: goals,
      };
    },
    getCertifications: async (_: any, payload: any) => {
      const result = await getCertifications({
        getCertifications:
          certificationsDb.getCertificationsForDepartmentWithNewTypologies,
      })({
        offset: payload.offset,
        limit: payload.limit,
        departmentId: payload.departmentId,
        searchText: payload.searchText,
      });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getRegions: async (_: any, _payload: any) => getRegions(),
    getDepartments: async (_: any, _payload: any) => getDepartments(),
    getDegrees: async (_: any, _payload: any) => getDegrees(),
    getVulnerabilityIndicators: async (_: any, _payload: any) =>
      getVulnerabilityIndicators(),
    getDropOutReasons: async (_: any, _payload: any) => getDropOutReasons(),
    getReorientationReasons: async (_: any, _payload: any) =>
      getReorientationReasons(),

    getDomaines: () => prismaClient.domaine.findMany(),
    getConventionCollectives: () =>
      prismaClient.conventionCollective.findMany(),
  },
};
