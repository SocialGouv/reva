import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { REST_API_URL } from "@/config/config";
import { JuryInfoInput } from "@/graphql/generated/graphql";

const getJuryByCandidacyIdQuery = graphql(`
  query getJuryByCandidacyId($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
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
        convocationFile {
          name
          url
          previewUrl
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
  mutation jury_updateResult($juryId: ID!, $input: JuryInfoInput!) {
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

type ScheduleJuryInputType = {
  candidacyId: string;
  date: string;
  time?: string;
  timeSpecified: boolean;
  address?: string;
  information?: string;
  convocationFile?: File;
};

export const useJuryPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
    juryId?: string[];
  }>();

  const { accessToken } = useKeycloakContext();

  const getCandidacy = useQuery({
    queryKey: ["getJuryByCandidacyId", candidacyId],
    queryFn: () =>
      graphqlClient.request(getJuryByCandidacyIdQuery, {
        candidacyId: candidacyId,
      }),
  });

  const scheduleJury = useMutation({
    mutationKey: ["scheduleJuryByCandidacyId", candidacyId],
    mutationFn: (data: ScheduleJuryInputType) => {
      const formData = new FormData();
      formData.append("candidacyId", data.candidacyId);
      formData.append("date", data.date);
      formData.append("timeSpecified", data.timeSpecified ? "true" : "false");

      if (data.time) {
        formData.append("time", data.time);
      }
      if (data.address) {
        formData.append("address", data.address);
      }
      if (data.information) {
        formData.append("information", data.information);
      }
      if (data.convocationFile) {
        formData.append("convocationFile", data.convocationFile);
      }

      return fetch(`${REST_API_URL}/jury/schedule-session`, {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
    },
    onSuccess: () => {
      getCandidacy.refetch();
    },
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
    scheduleJury,
    updateJuryResult,
    revokeJuryDecision,
  };
};
