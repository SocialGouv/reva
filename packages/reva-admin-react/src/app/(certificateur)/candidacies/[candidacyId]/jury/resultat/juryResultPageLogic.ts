import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { JuryInfoInput } from "@/graphql/generated/graphql";

const getJuryByCandidacyIdQuery = graphql(`
  query getJuryForResultPageByCandidacyId($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      isCertificationPartial
      typeAccompagnement
      candidate {
        firstname
        lastname
      }
      activeDossierDeValidation {
        updatedAt
        decision
      }
      certification {
        id
        label
        codeRncp
        typeDiplome
      }
      jury {
        id
        dateOfSession
        timeOfSession
        timeSpecified
        addressOfSession
        informationOfSession
        result
        dateOfResult
        informationOfResult
        juryResultByCompetenceBlocs {
          competenceBloc {
            id
            code
            label
          }
          isCompetenceBlocValidated
        }
        previouslyValidatedBlocks {
          id
          code
          label
        }
        convocationFile {
          name
          url
          previewUrl
        }
      }
      feasibility {
        dematerializedFeasibilityFile {
          blocsDeCompetences {
            certificationCompetenceBloc {
              id
              label
              code
            }
          }
        }
      }
      historyJury {
        id
        dateOfSession
        timeOfSession
        timeSpecified
        addressOfSession
        informationOfSession
        result
        dateOfResult
        informationOfResult
        juryResultByCompetenceBlocs {
          competenceBloc {
            id
            code
            label
          }
          isCompetenceBlocValidated
        }
        convocationFile {
          name
          url
          previewUrl
        }
      }
    }
  }
`);

const updateJuryResultMutation = graphql(`
  mutation jury_updateResultWithBlocks($juryId: ID!, $input: JuryInfoInput!) {
    jury_updateResult(juryId: $juryId, input: $input) {
      id
      dateOfSession
      timeOfSession
      timeSpecified
      addressOfSession
      informationOfSession
      result
      dateOfResult
      informationOfResult
      juryResultByCompetenceBlocs {
        competenceBloc {
          id
          code
          label
        }
        isCompetenceBlocValidated
      }
      previouslyValidatedBlocks {
        id
        code
        label
      }
      convocationFile {
        name
        url
        previewUrl
      }
    }
  }
`);

const revokeJuryDecisionMutation = graphql(`
  mutation jury_revokeDecision($juryId: ID!, $reason: String) {
    jury_revokeDecision(juryId: $juryId, reason: $reason) {
      id
    }
  }
`);

export const useJuryResultPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
    juryId?: string[];
  }>();

  const getCandidacy = useQuery({
    queryKey: ["getJuryForResultPageByCandidacyId", candidacyId],
    queryFn: () =>
      graphqlClient.request(getJuryByCandidacyIdQuery, {
        candidacyId: candidacyId,
      }),
  });

  const updateJuryResult = useMutation({
    mutationFn: ({ juryId, input }: { juryId: string; input: JuryInfoInput }) =>
      graphqlClient.request(updateJuryResultMutation, {
        juryId,
        input,
      }),
    onSuccess: () => {
      getCandidacy.refetch();
    },
  });

  const revokeJuryDecision = useMutation({
    mutationFn: ({ juryId, reason }: { juryId: string; reason?: string }) =>
      graphqlClient.request(revokeJuryDecisionMutation, {
        juryId,
        reason,
      }),
    onSuccess: () => {
      getCandidacy.refetch();
    },
  });

  return {
    getCandidacy,
    updateJuryResult,
    revokeJuryDecision,
  };
};
