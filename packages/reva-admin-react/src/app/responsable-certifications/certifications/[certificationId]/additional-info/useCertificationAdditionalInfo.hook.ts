import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import { graphql } from "@/graphql/generated";
import { UpdateCertificationAdditionalInfoInput } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";

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
        linkToJuryGuide
        certificationExpertContactDetails
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

  const updateCertificationAdditionalInfo = async (
    input: UpdateCertificationAdditionalInfoInput,
  ) => {
    try {
      const result = await urqlClient.mutation(
        updateCertificationAdditionalInfoMutation,
        {
          input,
        },
      );
      if (result.error) {
        throw new Error(result.error.graphQLErrors[0].message);
      }
      successToast("Modification enregistrée");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return {
    certification,
    getCertificationQueryStatus,
    updateCertificationAdditionalInfo,
  };
};
