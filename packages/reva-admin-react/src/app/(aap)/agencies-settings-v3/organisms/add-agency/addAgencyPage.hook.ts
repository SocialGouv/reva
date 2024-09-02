import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateAgencyInfoInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const createAgencyInfoMutation = graphql(`
  mutation createAgencyInfoMutationForAddAgencePage(
    $data: CreateAgencyInfoInput!
  ) {
    organism_createAgencyInfo(data: $data)
  }
`);

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

export const useAgencyPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: organismData } = useQuery({
    queryKey: ["organism"],
    queryFn: () => graphqlClient.request(HeadAgencyInfoQuery),
  });

  const createAgencyInfo = useMutation({
    mutationFn: (data: CreateAgencyInfoInput) =>
      graphqlClient.request(createAgencyInfoMutation, {
        data,
      }),
    mutationKey: ["organisms"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  const headAgencyPhone =
    organismData?.account_getAccountForConnectedUser?.organism
      ?.contactAdministrativePhone;
  const headAgencyEmail =
    organismData?.account_getAccountForConnectedUser?.organism
      ?.contactAdministrativeEmail;

  return { createAgencyInfo, headAgencyPhone, headAgencyEmail };
};
