"use client";

import { format } from "date-fns";
import { CertificationAuthorityInfoCallout } from "../../certification-authority-info-callout/CertificationAuthorityInfoCallout";

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
      <dd className="font-medium ready-for-jury-estimated-date-text">
        {readyForJuryEstimatedAt
          ? format(readyForJuryEstimatedAt, "dd/MM/yyyy")
          : ""}
      </dd>
    </dl>

    <CertificationAuthorityInfoCallout {...certificationAuthorityInfo} />
  </div>
);
