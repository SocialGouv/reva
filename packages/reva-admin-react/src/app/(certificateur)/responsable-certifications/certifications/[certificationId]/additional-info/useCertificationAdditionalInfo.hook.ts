import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useUrqlClient } from "@/components/urql-client";
import { graphql } from "@/graphql/generated";
import { UpdateCertificationAdditionalInfoInput } from "@/graphql/generated/graphql";

const getCertificationQuery = graphql(`
  query getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      additionalInfo {
        linkToReferential
        linkToCorrespondenceTable
        dossierDeValidationTemplate {
          url
          name
          previewUrl
          mimeType
        }
        additionalDocuments {
          url
          name
          previewUrl
          mimeType
        }
        dossierDeValidationLink
        linkToJuryGuide
        certificationExpertContactDetails
        certificationExpertContactPhone
        certificationExpertContactEmail
        usefulResources
        commentsForAAP
      }
    }
  }
`);

const updateCertificationAdditionalInfoMutation = graphql(`
  mutation updateCertificationAdditionalInfo(
    $input: UpdateCertificationAdditionalInfoInput!
  ) {
    referential_updateCertificationAdditionalInfo(input: $input) {
      id
    }
  }
`);

export const useUpdateAdditionalInfoPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const urqlClient = useUrqlClient();

  const {
    data: getCertificationQueryResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "certifications",
      "getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationQueryResponse?.getCertification;

  const updateCertificationAdditionalInfo = useMutation({
    mutationFn: async (input: UpdateCertificationAdditionalInfoInput) => {
      const result = await urqlClient.mutation(
        updateCertificationAdditionalInfoMutation,
        {
          input,
        },
      );
      if (result.error) {
        throw new Error(result.error.graphQLErrors[0].message);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationId],
      }),
  });

  return {
    certification,
    getCertificationQueryStatus,
    updateCertificationAdditionalInfo,
  };
};
