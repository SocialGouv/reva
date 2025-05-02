import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash";
import { useMemo } from "react";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage(
    $certificationAuthorityLocalAccountId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
        email
      }
      contactFullName
      contactEmail
      contactPhone
      certificationAuthority {
        label
      }
      departments {
        id
        label
      }
      certifications {
        id
      }
    }
    getRegions {
      id
      label
      departments {
        id
        label
      }
    }
  }
`);

export const useUpdateLocalAccountInterventionAreaPage = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
      }),
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  const regions = useMemo(
    () => sortBy(data?.getRegions, (r) => r.label),
    [data],
  );

  return {
    certificationAuthorityLocalAccount,
    regions,
    isLoading,
  };
};
