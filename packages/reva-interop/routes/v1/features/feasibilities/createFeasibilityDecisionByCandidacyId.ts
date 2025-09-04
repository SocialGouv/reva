import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";
import { UploadedFile } from "../../../../utils/types.js";
import { decisionDossierDeFaisabiliteSchema } from "../../schemas.js";

const getFeasibilityDecisionByCandidacyIdQuery = graphql(`
  query getFeasibilityDecisionByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      feasibility {
        id
        feasibilityFormat
        decision
        decisionComment
        decisionSentAt
        decisionFile {
          name
          mimeType
          previewUrl
        }
      }
    }
  }
`);

const createFeasibilityDecisionByCandidacyIdMutation = graphql(`
  mutation createFeasibilityDecisionByCandidacyIdMutation(
    $input: DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateCertificationAuthorityDecision(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

const statusMapFromInteropToGql: Record<
  (typeof decisionDossierDeFaisabiliteSchema)["enum"][number],
  "REJECTED" | "ADMISSIBLE" | "INCOMPLETE" | "COMPLETE"
> = {
  IRRECEVABLE: "REJECTED",
  RECEVABLE: "ADMISSIBLE",
  INCOMPLET: "INCOMPLETE",
  COMPLET: "COMPLETE",
};

export const createFeasibilityDecisionByCandidacyId = async (
  graphqlClient: Client,
  keycloakJwt: string,
  candidacyId: string,
  params: {
    decision: "IRRECEVABLE" | "RECEVABLE" | "INCOMPLET" | "COMPLET";
    commentaire?: string;
    document?: UploadedFile;
  },
) => {
  const response = await graphqlClient.query(
    getFeasibilityDecisionByCandidacyIdQuery,
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

  const { feasibility } = candidacy;
  if (!feasibility) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  if (feasibility.feasibilityFormat == "UPLOADED_PDF") {
    await createFeasibilityDecisionForPdf(keycloakJwt, feasibility.id, params);
  } else if (feasibility.feasibilityFormat == "DEMATERIALIZED") {
    await createFeasibilityDecisionForDemat(graphqlClient, candidacyId, params);
  }

  const r = await graphqlClient.query(
    getFeasibilityDecisionByCandidacyIdQuery,
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

const createFeasibilityDecisionForPdf = async (
  keycloakJwt: string,
  feasibilityId: string,
  params: {
    decision: "IRRECEVABLE" | "RECEVABLE" | "INCOMPLET" | "COMPLET";
    commentaire?: string;
    document?: UploadedFile;
  },
) => {
  const { decision, commentaire, document } = params;

  const formData = new FormData();

  formData.append("decision", statusMapFromInteropToGql[decision]);

  if (commentaire) {
    formData.append("comment", commentaire);
  }
  if (document) {
    const file = getFileFromBuffer(document);
    formData.append("infoFile", file);
  }

  const REST_API_URL = process.env.REST_API_URL || "http://localhost:8080/api";

  await fetch(`${REST_API_URL}/feasibility/${feasibilityId}/decision`, {
    method: "post",
    headers: {
      authorization: `Bearer ${keycloakJwt}`,
    },
    body: formData,
  });
};

const createFeasibilityDecisionForDemat = async (
  graphqlClient: Client,
  candidacyId: string,
  params: {
    decision: "IRRECEVABLE" | "RECEVABLE" | "INCOMPLET" | "COMPLET";
    commentaire?: string;
    document?: UploadedFile;
  },
) => {
  const { decision, commentaire, document } = params;

  const r = await graphqlClient.mutation(
    createFeasibilityDecisionByCandidacyIdMutation,
    {
      input: {
        decisionFile: document ? getFileFromBuffer(document) : undefined,
        decision: statusMapFromInteropToGql[decision],
        decisionComment: commentaire,
      },
      candidacyId,
    },
  );
  if (r.error) {
    throw r.error;
  }
};

const getFileFromBuffer = (document: UploadedFile) => {
  const buffer = Buffer.from(document._buf);
  const file = new File([buffer], document.filename, {
    type: document.mimetype,
  });
  return file;
};
