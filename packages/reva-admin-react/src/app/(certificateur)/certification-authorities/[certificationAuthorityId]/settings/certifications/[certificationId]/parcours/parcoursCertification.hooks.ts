import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAndParcoursQuery = graphql(`
  query getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery(
    $certificationId: ID!
    $certificationAuthorityId: ID!
    $parcoursOffset: Int!
    $parcoursLimit: Int!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
      parcours(offset: $parcoursOffset, limit: $parcoursLimit) {
        rows {
          id
          label
          nomEtablissement
        }
        info {
          totalRows
          totalPages
        }
      }
    }
    certification_authority_getParcoursForCertificationAndCertificationAuthority(
      certificationId: $certificationId
      certificationAuthorityId: $certificationAuthorityId
    ) {
      id
      label
    }
  }
`);

const updateParcoursForCertificationAndCertificationAuthorityMutation = graphql(
  `
    mutation updateParcoursForCertificationAndCertificationAuthorityMutation(
      $certificationId: ID!
      $certificationAuthorityId: ID!
      $parcoursCertificationIds: [ID!]!
    ) {
      certification_authority_updateParcoursForCertificationAndCertificationAuthority(
        certificationId: $certificationId
        certificationAuthorityId: $certificationAuthorityId
        parcoursCertificationIds: $parcoursCertificationIds
      )
    }
  `,
);

export const useParcoursCertificationPage = ({
  certificationId,
  certificationAuthorityId,
  page,
}: {
  certificationId: string;
  certificationAuthorityId: string;
  page: number;
}) => {
  const RECORDS_PER_PAGE = 10;
  const parcoursOffset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const updateParcoursForCertificationAndCertificationAuthority = useMutation({
    mutationFn: ({
      certificationId,
      certificationAuthorityId,
      parcoursCertificationIds,
    }: {
      certificationId: string;
      certificationAuthorityId: string;
      parcoursCertificationIds: string[];
    }) =>
      graphqlClient.request(
        updateParcoursForCertificationAndCertificationAuthorityMutation,
        {
          certificationId,
          certificationAuthorityId,
          parcoursCertificationIds,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityId, certificationId],
      });
    },
  });

  const {
    data: getCertificationAndParcoursResponse,
    status: getCertificationAndParcoursStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityId,
      certificationId,
      page,
      "getCertificationAndParcoursForCertificationAuthorityParcoursPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAndParcoursQuery, {
        certificationId,
        certificationAuthorityId,
        parcoursOffset,
        parcoursLimit: RECORDS_PER_PAGE,
      }),
  });

  const certification = getCertificationAndParcoursResponse?.getCertification;
  const certificationAuthorityParcours =
    getCertificationAndParcoursResponse?.certification_authority_getParcoursForCertificationAndCertificationAuthority;
  return {
    certification,
    certificationAuthorityParcours,
    getCertificationAndParcoursStatus,
    updateParcoursForCertificationAndCertificationAuthority,
  };
};
