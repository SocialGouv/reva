import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sortBy } from "lodash";
import { useMemo } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage(
    $certificationAuthorityLocalAccountId: ID!
    $certificationAuthorityStructureId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
      }
      departments {
        id
        code
        label
      }
      certificationAuthority {
        label
        departments {
          id
          code
          label
          region {
            id
            label
          }
        }
      }
    }
    certification_authority_getCertificationAuthorityStructure(
      id: $certificationAuthorityStructureId
    ) {
      id
      label
    }
  }
`);

const updateCertificationAuthorityLocalAccountDepartmentsMutation = graphql(`
  mutation updateCertificationAuthorityLocalAccountDepartmentsForAdminUpdateLocalAccountInterventionAreaPage(
    $certificationAuthorityLocalAccountId: ID!
    $departmentIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityLocalAccountDepartments(
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
      departmentIds: $departmentIds
    ) {
      id
      departments {
        id
        code
        label
      }
    }
  }
`);

export const useUpdateLocalAccountInterventionAreaPage = ({
  certificationAuthorityLocalAccountId,
  certificationAuthorityStructureId,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
        certificationAuthorityStructureId,
      }),
  });

  const updateCertificationAuthorityLocalAccountDepartments = useMutation({
    mutationFn: (departmentIds: string[]) =>
      graphqlClient.request(
        updateCertificationAuthorityLocalAccountDepartmentsMutation,
        {
          certificationAuthorityLocalAccountId,
          departmentIds,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          certificationAuthorityLocalAccountId,
          "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        ],
      });
    },
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  const certificationAuthorityStructure =
    data?.certification_authority_getCertificationAuthorityStructure;

  type Region = {
    id: string;
    label: string;
    departments: { id: string; code: string; label: string }[];
  };

  const regions = useMemo(
    () =>
      sortBy(
        data?.certification_authority_getCertificationAuthorityLocalAccount?.certificationAuthority?.departments.reduce(
          (acc, department) => {
            if (department.region) {
              let region = acc.find((r) => r.id === department.region?.id);
              if (!region) {
                region = { ...department.region, departments: [] };
                acc.push(region);
              }
              region.departments.push({
                id: department.id,
                code: department.code,
                label: department.label,
              });
            }
            return acc;
          },
          [] as Region[],
        ),
        (r) => r.label,
      ),
    [data],
  );

  return {
    certificationAuthorityLocalAccount,
    certificationAuthorityStructure,
    regions,
    isLoading,
    updateCertificationAuthorityLocalAccountDepartments,
  };
};
