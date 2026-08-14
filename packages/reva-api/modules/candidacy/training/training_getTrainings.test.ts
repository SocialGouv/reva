import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const getTrainingsQuery = graphql(`
  query getTrainings {
    training_getTrainings {
      id
      label
    }
  }
`);

describe("security", () => {
  test("any authenticated user, unrelated to a candidacy: allowed", async () => {
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({ role: "candidate" }),
      },
    });

    await expect(
      graphqlClient.request(getTrainingsQuery),
    ).resolves.toBeDefined();
  });
});
