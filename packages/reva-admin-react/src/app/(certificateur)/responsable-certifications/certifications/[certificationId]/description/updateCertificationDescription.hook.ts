import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateCertificationDescriptionInput } from "@/graphql/generated/graphql";

const getCertificationQuery = graphql(`
  query getCertificationForCertificationRegistryManagerUpdateCertificationDescriptionPage(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      status
      rncpExpiresAt
      rncpPublishedAt
      rncpEffectiveAt
      rncpDeliveryDeadline
      availableAt
      typeDiplome
      juryTypeMiseEnSituationProfessionnelle
      juryTypeSoutenanceOrale
      juryFrequency
      juryFrequencyOther
      juryPlace
      juryEstimatedCost
      degree {
        id
        level
      }
      domains {
        id
        code
        label
        children {
          id
          code
          label
        }
      }
    }
  }
`);

const updateCertificationDescriptionMutation = graphql(`
  mutation updateCertificationDescriptionForCertificationRegistryManagerUpdateCertificationDescriptionPage(
    $input: UpdateCertificationDescriptionInput!
  ) {
    referential_updateCertificationDescription(input: $input) {
      id
    }
  }
`);

export const useUpdateCertificationDescriptionPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCertificationQueryResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "certifications",
      "getCertificationForCertificationRegistryManagerUpdateCertificationDescriptionPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationQueryResponse?.getCertification;

  const updateCertificationDescription = useMutation({
    mutationFn: (input: UpdateCertificationDescriptionInput) =>
      graphqlClient.request(updateCertificationDescriptionMutation, {
        input,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationId],
      }),
  });

  return {
    certification,
    getCertificationQueryStatus,
    updateCertificationDescription,
  };
};
