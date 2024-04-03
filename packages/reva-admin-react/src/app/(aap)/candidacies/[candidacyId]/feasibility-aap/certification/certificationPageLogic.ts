import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAapFeasibilityCertificationPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      certification {
        label
        codeRncp
        competenceBlocs {
          id
          code
          label
        }
      }
      dematerializedFeasibilityFile {
        firstForeignLanguage
        secondForeignLanguage
        option
        blocsDeCompetences {
          id
        }
      }
    }
  }
`);

const updateFeasibilityCertificationMutation = graphql(`
  mutation updateFeasibilityCertificationMutation(
    $input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput!
  ) {
    dematerialized_feasibility_file_createOrUpdateCertificationInfo(
      input: $input
    ) {
      id
    }
  }
`);

export const useCertificationPageLogic = () => {
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
      candidacyId: string;
      option?: string;
      firstForeignLanguage?: string;
      secondForeignLanguage?: string;
      blocDeCompetencesIds: string[];
    }) =>
      graphqlClient.request(updateFeasibilityCertificationMutation, {
        input,
      }),
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;
  const certification = candidacy?.certification;
  const dematerializedFeasibilityFile =
    candidacy?.dematerializedFeasibilityFile;
  return {
    certification,
    dematerializedFeasibilityFile,
    updateFeasibilityCertification,
  };
};
