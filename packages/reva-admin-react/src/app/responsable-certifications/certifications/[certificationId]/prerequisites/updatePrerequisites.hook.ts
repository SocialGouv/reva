import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateCertificationPrerequisitesInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCertificationQuery = graphql(`
  query getCertificationForUpdateCertificationPrerequisitesPage(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      codeRncp
      label
      prerequisites {
        id
        label
        index
      }
    }
  }
`);

const updateCertificationPrerequisitesMutation = graphql(`
  mutation updateCertificationPrerequisitesForUpdateCertificationPrerequisitesPage(
    $input: UpdateCertificationPrerequisitesInput!
  ) {
    referential_updateCertificationPrerequisites(input: $input) {
      id
    }
  }
`);

export const useUpdatePrerequisitesPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCertificationResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "certifications",
      "getCertificationForUpdateCertificationPrerequisitesPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const updateCertificationPrerequisites = useMutation({
    mutationFn: (
      input: Omit<UpdateCertificationPrerequisitesInput, "certificationId">,
    ) =>
      graphqlClient.request(updateCertificationPrerequisitesMutation, {
        input: {
          ...input,
          certificationId: certificationId,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationId],
      }),
  });

  const certification = getCertificationResponse?.getCertification;

  return {
    certification,
    getCertificationQueryStatus,
    updateCertificationPrerequisites,
  };
};
