import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { REST_API_URL } from "@/config/config";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { JuryInfoInput } from "@/graphql/generated/graphql";

const getJuryByCandidacyIdQuery = graphql(`
  query getJuryByCandidacyId($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        id
        label
        codeRncp
        typeDiplome {
          id
          label
        }
      }
      jury {
        id
        dateOfSession
        timeOfSession
        addressOfSession
        informationOfSession
        result
        dateOfResult
        isResultProvisional
        informationOfResult
        convocationFile {
          name
          url
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
      addressOfSession
      informationOfSession
      result
      dateOfResult
      isResultProvisional
      informationOfResult
      convocationFile {
        name
        url
      }
    }
  }
`);

export type ScheduleJuryInputType = {
  candidacyId: string;
  date: string;
  time?: string;
  address?: string;
  information?: string;
  convocationFile?: File;
};

export const useJuryPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId, juryId } = useParams<{
    candidacyId: string;
    juryId?: string[];
  }>();

  const { accessToken } = useKeycloakContext();

  const { data: candidacyData, refetch: refetchCandidacy } = useQuery({
    queryKey: ["getJuryByCandidacyId", candidacyId],
    queryFn: () =>
      graphqlClient.request(getJuryByCandidacyIdQuery, {
        candidacyId: candidacyId,
        // juryId: juryId?.[0],
      }),
  });

  const scheduleJury = useMutation({
    mutationKey: ["scheduleJuryByCandidacyId", candidacyId],
    mutationFn: (data: ScheduleJuryInputType) => {
      const formData = new FormData();
      formData.append("candidacyId", data.candidacyId);
      formData.append("date", data.date);

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
      refetchCandidacy();
    },
  });

  const updateJuryResult = useMutation({
    mutationFn: ({ juryId, input }: { juryId: string; input: JuryInfoInput }) =>
      graphqlClient.request(updateJuryResultMutation, {
        juryId,
        input,
      }),
    onSuccess: () => {
      refetchCandidacy();
    },
  });
  updateJuryResult;

  return {
    candidacy: candidacyData?.getCandidacyById,
    scheduleJury,
    updateJuryResult,
  };
};
