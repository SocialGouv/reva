import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";
import { decisionDossierDeValidationSchema } from "../../schemas.js";

const getDossierDeValidationDecisionByCandidacyIdQuery = graphql(`
  query getDossierDeValidationDecisionByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      activeDossierDeValidation {
        id
        decision
        decisionComment
        decisionSentAt
      }
    }
  }
`);

const dossierDeValidation_markAsIncompleteMutation = graphql(`
  mutation dossierDeValidation_markAsIncomplete(
    $dossierDeValidationId: ID!
    $decisionComment: String!
  ) {
    dossierDeValidation_markAsIncomplete(
      dossierDeValidationId: $dossierDeValidationId
      decisionComment: $decisionComment
    ) {
      id
      decision
      decisionComment
      decisionSentAt
    }
  }
`);

const dossierDeValidation_markAsCompleteMutation = graphql(`
  mutation dossierDeValidation_markAsComplete(
    $dossierDeValidationId: ID!
    $decisionComment: String!
  ) {
    dossierDeValidation_markAsComplete(
      dossierDeValidationId: $dossierDeValidationId
      decisionComment: $decisionComment
    ) {
      id
      decision
      decisionComment
      decisionSentAt
    }
  }
`);

export const createDossierDeValidationDecisionByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
  params: {
    decision: (typeof decisionDossierDeValidationSchema)["enum"][number];
    commentaire?: string;
  },
) => {
  const response = await graphqlClient.query(
    getDossierDeValidationDecisionByCandidacyIdQuery,
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

  const { activeDossierDeValidation } = candidacy;
  if (!activeDossierDeValidation) {
    throw new Error("Dossier de valiation non trouvé");
  }

  const { decision, commentaire } = params;

  if (decision == "SIGNALE") {
    await markossierDeValidationAsIncomplete(
      graphqlClient,
      activeDossierDeValidation.id,
      {
        commentaire,
      },
    );
  } else if (decision == "VERIFIE") {
    await markossierDeValidationAsComplete(
      graphqlClient,
      activeDossierDeValidation.id,
      {
        commentaire,
      },
    );
  }

  const r = await graphqlClient.query(
    getDossierDeValidationDecisionByCandidacyIdQuery,
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

const markossierDeValidationAsIncomplete = async (
  graphqlClient: Client,
  dossierDeValidationId: string,
  params: {
    commentaire?: string;
  },
) => {
  const { commentaire } = params;

  const r = await graphqlClient.mutation(
    dossierDeValidation_markAsIncompleteMutation,
    {
      dossierDeValidationId,
      decisionComment: commentaire || "",
    },
  );
  if (r.error) {
    throw r.error;
  }
};

const markossierDeValidationAsComplete = async (
  graphqlClient: Client,
  dossierDeValidationId: string,
  params: {
    commentaire?: string;
  },
) => {
  const { commentaire } = params;

  const r = await graphqlClient.mutation(
    dossierDeValidation_markAsCompleteMutation,
    {
      dossierDeValidationId,
      decisionComment: commentaire || "",
    },
  );
  if (r.error) {
    throw r.error;
  }
};
