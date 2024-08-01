import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { FeasibilityDecision } from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";

const AlertDffState = ({
  decision,
  decisionSentAt,
  decisionComment,
  sentToCertificationAuthorityAt,
}: {
  decision: FeasibilityDecision;
  decisionSentAt: Date;
  decisionComment?: string | null;
  sentToCertificationAuthorityAt: Date;
}) => {
  const feasibilityIsPending = decision === "PENDING";

  if (feasibilityIsPending && sentToCertificationAuthorityAt) {
    return (
      <Alert
        severity="success"
        title={`Dossier envoyé au certificateur le ${format(sentToCertificationAuthorityAt, "dd/MM/yyyy")}`}
        className="mb-6"
      />
    );
  }

  if (decision !== "PENDING") {
    return (
      <DecisionSentComponent
        decisionSentAt={decisionSentAt}
        decision={decision}
        decisionComment={decisionComment}
      />
    );
  }

  return null;
};

export const SendFileCertificationAuthoritySection = ({
  sentToCertificationAuthorityAt,
  isReadyToBeSentToCertificationAuthority,
  decisionSentAt,
  decision,
  decisionComment,
}: {
  sentToCertificationAuthorityAt?: Date | null;
  isReadyToBeSentToCertificationAuthority?: boolean;
  decisionSentAt: Date;
  decision: FeasibilityDecision;
  decisionComment?: string | null;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const feasibilityIsIncomplete = decision === "INCOMPLETE";
  const feasibilityHasBeenSent = !!sentToCertificationAuthorityAt;
  const feasibilityFileNeedsNewOrResendAction =
    !feasibilityHasBeenSent || feasibilityIsIncomplete;

  return (
    <div>
      <h2 className="mt-0">Vérifier et envoyer le dossier au certificateur </h2>

      <AlertDffState
        sentToCertificationAuthorityAt={
          sentToCertificationAuthorityAt as any as Date
        }
        decisionSentAt={decisionSentAt}
        decision={decision}
        decisionComment={decisionComment}
      />
      <div className="flex justify-end">
        <Button
          disabled={!isReadyToBeSentToCertificationAuthority}
          priority={
            feasibilityFileNeedsNewOrResendAction ? "primary" : "secondary"
          }
          onClick={() => {
            router.push(
              `/candidacies/${candidacyId}/feasibility-aap/send-file-certification-authority`,
            );
          }}
        >
          {feasibilityFileNeedsNewOrResendAction
            ? "Vérifier et envoyer"
            : "Voir le dossier"}
        </Button>
      </div>
    </div>
  );
};
