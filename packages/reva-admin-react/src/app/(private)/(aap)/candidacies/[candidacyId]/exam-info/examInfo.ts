import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/dist/client/components/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { ExamResult } from "@/graphql/generated/graphql";

const getCandidacyQuery = graphql(`
  query getCandidacyForExamInfoPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      examInfo {
        examResult
        estimatedExamDate
        actualExamDate
      }
    }
  }
`);

const updateExamInfoMutation = graphql(`
  mutation updateExamInfoMutationForExamInfoPage(
    $candidacyId: UUID!
    $examInfo: ExamInfoInput!
  ) {
    jury_updateExamInfo(candidacyId: $candidacyId, examInfo: $examInfo) {
      examResult
    }
  }
`);
export const useExamInfoPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const updateExamInfo = useMutation({
    mutationFn: ({
      actualExamDate,
      estimatedExamDate,
      examResult,
    }: {
      actualExamDate?: number;
      estimatedExamDate?: number;
      examResult?: ExamResult | null;
    }) =>
      graphqlClient.request(updateExamInfoMutation, {
        candidacyId,
        examInfo: { actualExamDate, estimatedExamDate, examResult },
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  return {
    candidacy,
    getCandidacyStatus,
    updateExamInfo,
  };
};
