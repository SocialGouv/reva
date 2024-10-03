"use client";

import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { format } from "date-fns";

export const ReadOnlyReadyForJuryEstimatedDateTab = ({
  readyForJuryEstimatedAt,
  certificationAuthorityInfo,
}: {
  readyForJuryEstimatedAt?: Date;
  certificationAuthorityInfo: { name: string; email: string };
}) => (
  <div className="flex flex-col">
    <p>
      La date prévisionnelle est une simple estimation. Il s’agit de la date à
      laquelle vous pensez avoir finalisé son dossier de validation.
      Rassurez-vous, si vous ne la respectez pas, ce n’est pas compromettant
      pour votre parcours !
    </p>
    <dl>
      <dt>date prévisionelle</dt>
      <dd className="font-medium">
        {readyForJuryEstimatedAt
          ? format(readyForJuryEstimatedAt, "dd/MM/yyyy")
          : ""}
      </dd>
    </dl>

    <CallOut title="Comment contacter mon certificateur ?" className="mt-8">
      <div className="mt-2">{certificationAuthorityInfo.name}</div>
      <div>{certificationAuthorityInfo.email}</div>
    </CallOut>
  </div>
);
