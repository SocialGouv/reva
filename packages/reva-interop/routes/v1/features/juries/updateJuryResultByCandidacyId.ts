import { Client } from "@urql/core";

import { JuryResult } from "../../../../graphql/generated/graphql.js";
import { graphql } from "../../../../graphql/generated/index.js";
import { resultatJurySchema } from "../../schemas.js";

const getJuryResultByCandidacyIdQuery = graphql(`
  query getJuryResultByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      jury {
        id
        result
        dateOfResult
        informationOfResult
      }
    }
  }
`);

const updateJuryResultMutation = graphql(`
  mutation jury_updateResult($juryId: ID!, $input: JuryInfoInput!) {
    jury_updateResult(juryId: $juryId, input: $input) {
      id
      result
      dateOfResult
      informationOfResult
    }
  }
`);

const resultatMapFromInteropToGql: Record<
  (typeof resultatJurySchema)["enum"][number],
  JuryResult
> = {
  SUCCES_TOTAL_CERTIFICATION_COMPLETE: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE:
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
  SUCCES_PARTIEL_CERTIFICATION_COMPLETE:
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  SUCCES_TOTAL_CERTIFICATION_PARTIELLE: "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  SUCCES_PARTIEL_CERTIFICATION_PARTIELLE:
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  ECHEC: "FAILURE",
  CANDIDAT_EXCUSE: "CANDIDATE_EXCUSED",
  CANDIDAT_ABSENT: "CANDIDATE_ABSENT",
  EN_ATTENTE_DE_RESULTAT: "AWAITING_RESULT",
};

export const updateJuryResultByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
  params: {
    resultat: (typeof resultatJurySchema)["enum"][number];
    commentaire?: string;
  },
) => {
  const response = await graphqlClient.query(
    getJuryResultByCandidacyIdQuery,
    {
      candidacyId: candidacyId,
    },
    {
      requestPolicy: "network-only",
    },
  );
  if (response.error) {
    throw response.error;
  }

  const candidacy = response.data?.getCandidacyById;
  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const { jury } = candidacy;
  if (!jury) {
    throw new Error("Jury non trouvé");
  }

  await updateJuryResult(graphqlClient, jury.id, params);

  const r = await graphqlClient.query(
    getJuryResultByCandidacyIdQuery,
    {
      candidacyId: candidacyId,
    },
    {
      requestPolicy: "network-only",
    },
  );
  if (r.error) {
    throw r.error;
  }

  return r.data?.getCandidacyById;
};

const updateJuryResult = async (
  graphqlClient: Client,
  juryId: string,
  params: {
    resultat: (typeof resultatJurySchema)["enum"][number];
    commentaire?: string;
  },
) => {
  const { resultat, commentaire } = params;

  const r = await graphqlClient.mutation(updateJuryResultMutation, {
    juryId,
    input: {
      result: resultatMapFromInteropToGql[resultat],
      informationOfResult: commentaire,
    },
  });
  if (r.error) {
    throw r.error;
  }
};
