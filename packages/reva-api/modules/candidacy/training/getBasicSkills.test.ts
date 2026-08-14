import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const getBasicSkillsQuery = graphql(`
  query getBasicSkills {
    getBasicSkills {
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
      graphqlClient.request(getBasicSkillsQuery),
    ).resolves.toBeDefined();
  });
});
