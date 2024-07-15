import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";

import {
  FeasibilityDecisionHistory,
  FeasibilityDecisionInfo,
} from "@/components/feasibility-decison-history";

import { useHooks } from "./FeasibiltyStatus.hooks";

import { CertificationAuthorityLocalAccounts } from "../CertificationAuthorityLocalAccounts";

interface Props {
  candidacyId: string;
}

export const FeasibiltyStatus = (props: Props): JSX.Element => {
  const { candidacyId } = props;

  const { candidacy } = useHooks(candidacyId);

  const feasibility = candidacy.data?.getCandidacyById?.feasibility;
  const certificationAuthority = feasibility?.certificationAuthority;

  const feasibilityFile = feasibility?.feasibilityFile;
  const IDFile = feasibility?.IDFile;
  const documentaryProofFile = feasibility?.documentaryProofFile;
  const certificateOfAttendanceFile = feasibility?.certificateOfAttendanceFile;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4>Décision prise concernant ce dossier</h4>
        {feasibility?.decision == "PENDING" && (
          <GrayCard className="gap-4 italic">En attente</GrayCard>
        )}

        {feasibility?.decision && feasibility?.decision != "PENDING" && (
          <FeasibilityDecisionInfo
            id={feasibility.id}
            decision={feasibility.decision}
            decisionSentAt={feasibility.decisionSentAt}
            decisionComment={feasibility.decisionComment}
          />
        )}
      </div>

      {feasibilityFile && (
        <GrayCard>
          <h6 className="mb-1">Dossier de faisabilité</h6>
          <FileLink url={feasibilityFile.url} text={feasibilityFile.name} />
        </GrayCard>
      )}

      {IDFile && (
        <GrayCard>
          <h6 className="mb-1">Pièce d'identité</h6>
          <FileLink url={IDFile.url} text={IDFile.name} />
        </GrayCard>
      )}

      {documentaryProofFile && (
        <GrayCard>
          <h6 className="mb-1">Justificatif(s)</h6>
          <FileLink
            url={documentaryProofFile.url}
            text={documentaryProofFile.name}
          />
        </GrayCard>
      )}

      {certificateOfAttendanceFile && (
        <GrayCard>
          <h6 className="mb-1">
            Attestation ou certificat de suivi de formation
          </h6>
          <FileLink
            url={certificateOfAttendanceFile.url}
            text={certificateOfAttendanceFile.name}
          />
        </GrayCard>
      )}

      {certificationAuthority && (
        <>
          <CertificationAuthorityLocalAccounts
            certificationAuthorityId={certificationAuthority.id}
            certificationId={
              candidacy.data?.getCandidacyById?.certification?.id
            }
            departmentId={candidacy.data?.getCandidacyById?.department?.id}
          />
        </>
      )}

      {feasibility?.history && feasibility.history.length > 0 && (
        <FeasibilityDecisionHistory history={feasibility?.history} />
      )}
    </div>
  );
};

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink
    text={text}
    title={text}
    url={url}
    className="fr-link fr-icon-download-line fr-link--icon-right text-blue-900 text-lg mr-auto break-words"
  />
);
