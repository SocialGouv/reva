import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import {
  CreateCertificationAuthorityLocalAccountInput,
  UpdateCertificationAuthorityLocalAccountInput,
} from "@/graphql/generated/graphql";

import { useQuery, useMutation } from "@tanstack/react-query";

const getAccountForConnectionUser = graphql(`
  query getCertifictionAuthority {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
        contactFullName
        contactEmail
        departments {
          id
          label
          code
          region {
            id
            label
            code
          }
        }
        certifications {
          id
          label
          codeRncp
          status
        }
        certificationAuthorityLocalAccounts {
          id
          account {
            firstname
            lastname
            email
          }
          departments {
            id
            label
            code
            region {
              id
              label
              code
            }
          }
          certifications {
            id
            label
          }
        }
      }
    }
  }
`);

const createCertificationAuthorityMutation = graphql(`
  mutation createCertificationAuthorityMutation(
    $data: CreateCertificationAuthorityLocalAccountInput!
  ) {
    certification_authority_createCertificationAuthorityLocalAccount(
      input: $data
    ) {
      id
    }
  }
`);

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityMutation(
    $data: UpdateCertificationAuthorityLocalAccountInput!
  ) {
    certification_authority_updateCertificationAuthorityLocalAccount(
      input: $data
    ) {
      id
    }
  }
`);

const deleteCertificationAuthorityLocalAccountMutation = graphql(`
  mutation deleteCertificationAuthorityLocalAccountMutation(
    $certificationAuthorityLocalAccountId: ID!
  ) {
    certification_authority_deleteCertificationAuthorityLocalAccount(
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    ) {
      id
    }
  }
`);

export const useCertificationAuthorityQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const queryCertifictionAuthority = useQuery({
    queryKey: ["account"],
    queryFn: () => graphqlClient.request(getAccountForConnectionUser),
  });

  const certifictionAuthority =
    queryCertifictionAuthority.data?.account_getAccountForConnectedUser
      ?.certificationAuthority;

  const useCreateCertificationAuthorityMutation = useMutation({
    mutationFn: (data: CreateCertificationAuthorityLocalAccountInput) =>
      graphqlClient.request(createCertificationAuthorityMutation, {
        data,
      }),
  });

  const useUpdateCertificationAuthorityMutation = useMutation({
    mutationFn: (data: UpdateCertificationAuthorityLocalAccountInput) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        data,
      }),
  });

  const useDeleteCertificationAuthorityLocalAccountMutation = useMutation({
    mutationFn: (certificationAuthorityLocalAccountId: string) =>
      graphqlClient.request(deleteCertificationAuthorityLocalAccountMutation, {
        certificationAuthorityLocalAccountId,
      }),
  });

  return {
    certifictionAuthority,
    certifictionAuthorityStatus: queryCertifictionAuthority.status,
    refetchCertifictionAuthority: queryCertifictionAuthority.refetch,
    useCreateCertificationAuthorityMutation,
    useUpdateCertificationAuthorityMutation,
    useDeleteCertificationAuthorityLocalAccountMutation,
  };
};
