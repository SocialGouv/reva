import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const HeadAgencyInfoQuery = graphql(`
  query getHeadAgencyInfo {
    account_getAccountForConnectedUser {
      organism {
        contactAdministrativeEmail
        contactAdministrativePhone
      }
    }
  }
`);

export const useOrganismInformationForm = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: organismData } = useQuery({
    queryKey: ["organism"],
    queryFn: () => graphqlClient.request(HeadAgencyInfoQuery),
  });

  const headAgencyPhone =
    organismData?.account_getAccountForConnectedUser?.organism
      ?.contactAdministrativePhone;
  const headAgencyEmail =
    organismData?.account_getAccountForConnectedUser?.organism
      ?.contactAdministrativeEmail;

  return { headAgencyPhone, headAgencyEmail };
};
