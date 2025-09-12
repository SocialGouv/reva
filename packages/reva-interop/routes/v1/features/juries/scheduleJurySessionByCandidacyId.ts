import { Client } from "@urql/core";
import { format, toDate } from "date-fns";

import { graphql } from "../../../../graphql/generated/index.js";
import { UploadedFile } from "../../../../utils/types.js";

const getJurySessionByCandidacyIdQuery = graphql(`
  query getJurySessionByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      jury {
        dateOfSession
        timeOfSession
        timeSpecified
        addressOfSession
        informationOfSession
      }
    }
  }
`);

export const scheduleJurySessionByCandidacyId = async (
  graphqlClient: Client,
  keycloakJwt: string,
  candidacyId: string,
  params: {
    date: string;
    heure?: string;
    adresseSession?: string;
    informationsSession?: string;
    document?: UploadedFile;
  },
) => {
  const response = await graphqlClient.query(
    getJurySessionByCandidacyIdQuery,
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

  await scheduleJurySession(keycloakJwt, candidacyId, params);

  const r = await graphqlClient.query(
    getJurySessionByCandidacyIdQuery,
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

const scheduleJurySession = async (
  keycloakJwt: string,
  candidacyId: string,
  params: {
    date: string;
    heure?: string;
    adresseSession?: string;
    informationsSession?: string;
    document?: UploadedFile;
  },
) => {
  const {
    date: dateParam,
    heure: heureParams,
    adresseSession,
    informationsSession,
    document,
  } = params;

  const formData = new FormData();

  let date = toDate(`${dateParam}T00:00:00`).valueOf().toString();
  let time;

  if (heureParams) {
    date = toDate(dateParam)
      .setHours(
        Number(heureParams.split(":")[0]),
        Number(heureParams.split(":")[1]),
      )
      .valueOf()
      .toString();
    time = toDate(format(`${dateParam}T${heureParams}`, "yyyy-MM-dd HH:mm"))
      .valueOf()
      .toString();
  }

  formData.append("candidacyId", candidacyId);
  formData.append("date", date);
  formData.append("timeSpecified", time ? "true" : "false");

  if (time) {
    formData.append("time", time);
  }

  if (adresseSession) {
    formData.append("address", adresseSession);
  }

  if (informationsSession) {
    formData.append("information", informationsSession);
  }

  if (document) {
    const file = getFileFromBuffer(document);
    formData.append("convocationFile", file);
  }

  const REST_API_URL = process.env.REST_API_URL || "http://localhost:8080/api";

  const response = await fetch(`${REST_API_URL}/jury/schedule-session`, {
    method: "post",
    headers: {
      authorization: `Bearer ${keycloakJwt}`,
    },
    body: formData,
  });

  const text = await response.text();
  if (text) {
    throw new Error(text);
  }
};

const getFileFromBuffer = (document: UploadedFile) => {
  const buffer = Buffer.from(document._buf);
  const file = new File([buffer], document.filename, {
    type: document.mimetype,
  });
  return file;
};
