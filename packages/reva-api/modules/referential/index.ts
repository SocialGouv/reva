import mercurius from "mercurius";

import { prismaClient } from "../../prisma/client";
import * as certificationsDb from "./database/certifications";
import * as degreesDb from "./database/degrees";
import * as dropOutReasonsDb from "./database/dropOutReasons";
import * as goalsDb from "./database/goals";
import * as locationsDb from "./database/locations";
import { getCertifications } from "./features/getCertifications";
import { getDegrees } from "./features/getDegrees";
import { getDepartments } from "./features/getDepartments";
import { getDropOutReasons } from "./features/getDropOutReasons";
import { getRegions } from "./features/getRegions";
import { getReorientationReasons } from "./features/getReorientationReasons";
import { getVulnerabilityIndicators } from "./features/getVulnerabilityIndicators";

export const resolvers = {
  Query: {
    // eslint-disable-next-line
    // @ts-ignore
    getReferential: async (_: any, _payload: any) => {
      const goals = (await goalsDb.getGoals()).orDefault([]);

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
    getRegions: async (_: any, _payload: any) => {
      const result = await getRegions({
        getRegions: locationsDb.getRegions,
      })();

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getDepartments: async (_: any, _payload: any) => {
      const result = await getDepartments({
        getDepartments: locationsDb.getDepartments,
      })();

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getDegrees: async (_: any, _payload: any) => {
      const result = await getDegrees({
        getDegrees: degreesDb.getDegrees,
      })();

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getVulnerabilityIndicators: async (_: any, _payload: any) =>
      getVulnerabilityIndicators(),
    getDropOutReasons: async (_: any, _payload: any) => {
      const result = await getDropOutReasons({
        getDropOutReasons: dropOutReasonsDb.getDropOutReasons,
      })();

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getReorientationReasons: async (_: any, _payload: any) =>
      getReorientationReasons(),

    getDomaines: () => prismaClient.domaine.findMany(),
    getConventionCollectives: () =>
      prismaClient.conventionCollective.findMany(),
  },
};
