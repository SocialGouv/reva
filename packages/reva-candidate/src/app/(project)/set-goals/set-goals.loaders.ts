import { graphql } from "@/graphql/generated";
import { Referential } from "@/graphql/generated/graphql";

import { getGraphQlClient } from "@/utils/graphql-client-server";

const GET_GOALS = graphql(`
  query getGoals {
    getReferential {
      goals {
        id
        label
        order
        needsAdditionalInformation
        isActive
      }
    }
  }
`);

export const getGoals = async (): Promise<Referential["goals"]> => {
  const { getReferential } = await getGraphQlClient().request(GET_GOALS);
  return getReferential.goals;
}