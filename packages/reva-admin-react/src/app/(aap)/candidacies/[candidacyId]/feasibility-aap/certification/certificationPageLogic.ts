import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAapFeasibilityCertificationPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      isCertificationPartial
      certification {
        id
        label
        codeRncp
        competenceBlocs {
          id
          code
          label
        }
      }
      feasibility {
        dematerializedFeasibilityFile {
          firstForeignLanguage
          secondForeignLanguage
          option
          certificationPartComplete
          blocsDeCompetences {
            certificationCompetenceBloc {
              id
            }
          }
        }
      }
    }
  }
`);

const updateFeasibilityCertificationMutation = graphql(`
  mutation updateFeasibilityCertificationMutation(
    $candidacyId: ID!
    $input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput!
  ) {
    dematerialized_feasibility_file_createOrUpdateCertificationInfo(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

export const useCertificationPageLogic = () => {
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [
      candidacyId,
      "getCandidacyByIdForAapFeasibilityCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const updateFeasibilityCertification = useMutation({
    mutationFn: (input: {
      option?: string;
      firstForeignLanguage?: string;
      secondForeignLanguage?: string;
      blocDeCompetencesIds: string[];
      completion: "COMPLETE" | "PARTIAL";
    }) =>
      graphqlClient.request(updateFeasibilityCertificationMutation, {
        input,
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          candidacyId,
          "getCandidacyByIdForAapFeasibilityCertificationPage",
        ],
      });
    },
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;
  const certification = candidacy?.certification;
  const dematerializedFeasibilityFile =
    candidacy?.feasibility?.dematerializedFeasibilityFile;
  return {
    candidacy,
    certification,
    dematerializedFeasibilityFile,
    updateFeasibilityCertification,
  };
};
