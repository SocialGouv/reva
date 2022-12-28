import mercurius from "mercurius";

import { getCertifications } from "../../../domain/features/getCertifications";
import { getDegrees } from "../../../domain/features/getDegrees";
import { getDepartments } from "../../../domain/features/getDepartments";
import { getRegions } from "../../../domain/features/getRegions";
import { getVulnerabilityIndicators } from "../../../domain/features/getVulnerabilityIndicators";
import * as certificationsDb from "../../database/postgres/certifications";
import * as degreesDb from "../../database/postgres/degrees";
import * as goalsDb from "../../database/postgres/goals";
import * as locationsDb from "../../database/postgres/locations";
import * as vulnerabilityIndicatorsDb from "../../database/postgres/vulnerabilityIndicators";

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
        getCertifications: certificationsDb.getCertifications,
      })({ departmentId: payload.departmentId });

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
    getVulnerabilityIndicators: async (_: any, _payload: any) => {
      const result = await getVulnerabilityIndicators({
        getVulnerabilityIndicators:
          vulnerabilityIndicatorsDb.getVulnerabilityIndicators,
      })();

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};
