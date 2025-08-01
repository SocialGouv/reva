import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { ValidateCertificationInput } from "@/graphql/generated/graphql";

const getCertificationQuery = graphql(`
  query getCertificationForCertificationRegistryManagerUpdateCertificationPage(
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
      expiresAt
      typeDiplome
      juryTypeMiseEnSituationProfessionnelle
      juryTypeSoutenanceOrale
      juryFrequency
      juryFrequencyOther
      juryPlace
      juryEstimatedCost
      additionalInfo {
        linkToReferential
        linkToCorrespondenceTable
        dossierDeValidationTemplate {
          name
          previewUrl
        }
        dossierDeValidationLink
        linkToJuryGuide
        certificationExpertContactDetails
        certificationExpertContactPhone
        certificationExpertContactEmail
        usefulResources
        commentsForAAP
        additionalDocuments {
          name
          previewUrl
        }
      }
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
      competenceBlocs {
        id
        code
        label
        competences {
          id
          label
        }
      }
      prerequisites {
        id
        label
      }
    }
  }
`);

const validateCertificationMutation = graphql(`
  mutation validateCertificationForCertificationRegistryManagerUpdateCertificationPage(
    $input: ValidateCertificationInput!
  ) {
    referential_validateCertification(input: $input) {
      id
    }
  }
`);

export const useUpdateCertificationPage = ({
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
      "getCertificationForCertificationRegistryManagerUpdateCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationQueryResponse?.getCertification;

  const validateCertification = useMutation({
    mutationFn: (input: ValidateCertificationInput) =>
      graphqlClient.request(validateCertificationMutation, {
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
    validateCertification,
  };
};
