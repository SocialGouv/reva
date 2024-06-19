"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { DropoutForm } from "./_components/DropoutForm";
import {
  ActiveDropoutReasons,
  CandidacyForDropout,
  useDropout,
} from "./_components/useDropout";
import { useCandidacyStatus } from "../../_components/candidacy.hook";

const CandidacyDropoutComponent = ({
  candidacy,
  activeDropoutReasons,
}: {
  candidacy: NonNullable<CandidacyForDropout>;
  activeDropoutReasons: NonNullable<ActiveDropoutReasons>;
}) => {
  const { canDroput } = useCandidacyStatus(candidacy);

  if (candidacy.candidacyDropOut?.dropOutReason) {
    return (
      <Alert
        title=""
        severity="info"
        className="my-4"
        description={`La candidature a déjà été abandonnée. Raison : ${candidacy.candidacyDropOut.dropOutReason.label} ${
          candidacy.candidacyDropOut.otherReasonContent
            ? ` - ${candidacy.candidacyDropOut.otherReasonContent}`
            : ""
        }`}
      />
    );
  }

  if (!canDroput) {
    return (
      <Alert
        title=""
        severity="warning"
        className="my-4"
        description="La candidature ne peut pas être abandonnée. Son statut ne le permet pas ou vous n'avez pas les permissions nécessaires."
      />
    );
  }

  return (
    <>
      <Alert
        title=""
        severity="warning"
        className="my-4"
        description={
          <>
            <p>
              Si vous déclarez l’abandon du candidat il ne pourra plus
              re-candidater dans le cadre de France VAE.
            </p>
            <p>
              Si le dossier du candidat que vous souhaitez mettre en abandon est
              constitué depuis moins de 6 mois, vous devez vous assurer d’avoir
              le justificatif du candidat confirmant son choix d’abandon.
            </p>
            <p>
              Si le cas d’abandon n’est pas listé ci-dessous, privilégiez la
              suppression de la candidature.
            </p>
          </>
        }
      />
      <DropoutForm activeDropoutReasons={activeDropoutReasons} />
    </>
  );
};

const CandidacyDropoutPage = () => {
  const { candidacy, candidacyId, activeDropoutReasons } = useDropout({});

  if (!candidacy || !activeDropoutReasons) {
    return null;
  }

  return (
    <>
      <h1 className="text-dsfrBlack-500 text-4xl mb-1">Abandon du candidat</h1>
      <p>
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <CandidacyDropoutComponent
        candidacy={candidacy}
        activeDropoutReasons={activeDropoutReasons}
      />
    </>
  );
};

export default CandidacyDropoutPage;
