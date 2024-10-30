"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { DropoutForm } from "./_components/DropoutForm";
import {
  ActiveDropoutReasons,
  CandidacyForDropout,
  useDropout,
} from "./_components/useDropout";
import { useCandidacyStatus } from "../../_components/candidacy.hook";
import { useAuth } from "@/components/auth/auth";
import Button from "@codegouvfr/react-dsfr/Button";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";

const CandidacyDropoutComponent = ({
  candidacy,
  activeDropoutReasons,
}: {
  candidacy: NonNullable<CandidacyForDropout>;
  activeDropoutReasons: NonNullable<ActiveDropoutReasons>;
}) => {
  const { canDroput } = useCandidacyStatus(candidacy);
  const { validateDropoutCandidacyById } = useDropout();

  const { isAdmin } = useAuth();

  if (candidacy.candidacyDropOut?.dropOutReason) {
    return (
      <>
        <div>
          {isAdmin && !candidacy.candidacyDropOut.proofReceivedByAdmin && (
            <p>
              Si un candidat a exprimé son souhait d’abandonner sa candidature,
              vous pouvez confirmer cet abandon ici. Attention, cette action est
              irréversible.
            </p>
          )}
          <p className="flex flex-col gap-6 p-8 bg-dsfr-light-neutral-grey-1000 m-0">
            <span>
              Candidature mise en abandon le :{" "}
              <strong>
                {format(candidacy.candidacyDropOut.createdAt, "d/MM/yyyy")}
              </strong>
            </span>

            <span>
              Raison :{" "}
              <strong>{candidacy.candidacyDropOut.dropOutReason.label}</strong>
            </span>

            {isAdmin && candidacy.candidacyDropOut.validatedAt && (
              <span>
                Confirmation par France VAE :{" "}
                <strong>
                  {format(candidacy.candidacyDropOut.validatedAt, "d/MM/yyyy")}
                </strong>
              </span>
            )}
          </p>
        </div>

        {isAdmin && !candidacy.candidacyDropOut.proofReceivedByAdmin && (
          <>
            <div className="h-[1px] bg-dsfrGray-contrast" />

            <form
              className="flex flex-col"
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                try {
                  await validateDropoutCandidacyById.mutateAsync();

                  successToast("L'abandon a été validé avec succès");
                } catch (error) {
                  graphqlErrorToast(error);
                }
              }}
            >
              <h2>Confirmer l’abandon du candidat</h2>
              <p>
                En confirmant que le candidat souhaite abandonner sa
                candidature, vous permettez à l’AAP d’accéder plus rapidement à
                la demande de paiement.
              </p>

              <Button className=" ml-auto" priority="primary">
                Confirmer l’abandon
              </Button>
            </form>
          </>
        )}
      </>
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
  const { candidacy, activeDropoutReasons } = useDropout();

  if (!candidacy || !activeDropoutReasons) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-dsfrBlack-500 text-4xl mb-1">Abandon du candidat</h1>

      <CandidacyDropoutComponent
        candidacy={candidacy}
        activeDropoutReasons={activeDropoutReasons}
      />
    </div>
  );
};

export default CandidacyDropoutPage;
