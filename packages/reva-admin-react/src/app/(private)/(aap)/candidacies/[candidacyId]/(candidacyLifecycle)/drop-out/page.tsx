"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useCandidacyStatus } from "../../_components/candidacy.hook";

import { CancelDropOutForm } from "./_components/CancelDropOutForm";
import { ConfirmDropOutForm } from "./_components/ConfirmDropOutForm";
import { DropoutForm } from "./_components/DropoutForm";
import {
  ActiveDropoutReasons,
  CandidacyForDropout,
  useDropout,
} from "./_components/useDropout";

const CandidacyDropoutComponent = ({
  candidacy,
  activeDropoutReasons,
}: {
  candidacy: NonNullable<CandidacyForDropout>;
  activeDropoutReasons: NonNullable<ActiveDropoutReasons>;
}) => {
  const { canDropout } = useCandidacyStatus(candidacy);
  const {
    validateDropoutCandidacyById,
    cancelDropoutCandidacyById,
    candidacyId,
  } = useDropout();

  const { isAdmin } = useAuth();
  const router = useRouter();

  const handleCancelDropoutCandidacy = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await cancelDropoutCandidacyById.mutateAsync();

      successToast("L'abandon a été annulé");
      router.push(`/candidacies/${candidacyId}/summary`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const handleConfirmDropoutCandidacy = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await validateDropoutCandidacyById.mutateAsync();

      successToast("L'abandon a été validé avec succès");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (candidacy.candidacyDropOut?.dropOutReason) {
    return (
      <>
        <div className="flex flex-col m-0">
          <div className="flex items-center gap-6 border-t border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey">
            <div>Date de la mise en abandon</div>
            <div className="font-bold flex-1 text-right">
              {format(candidacy.candidacyDropOut.createdAt, "d/MM/yyyy")}
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey">
            <div>Raison de l'abandon</div>
            <div className="font-bold flex-1 text-right">
              {candidacy.candidacyDropOut.dropOutReason.label}
            </div>
          </div>

          {isAdmin && candidacy.candidacyDropOut.validatedAt && (
            <div className="flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey">
              <div>Confirmation par France VAE</div>
              <div className="font-bold flex-1 text-right">
                {format(candidacy.candidacyDropOut.validatedAt, "d/MM/yyyy")}
              </div>
            </div>
          )}
        </div>
        {isAdmin &&
          candidacy.candidacyDropOut.proofReceivedByAdmin &&
          !candidacy.candidacyDropOut.dropOutConfirmedByCandidate && (
            <CancelDropOutForm
              handleCancelDropoutCandidacy={handleCancelDropoutCandidacy}
            />
          )}

        {isAdmin && !candidacy.candidacyDropOut.proofReceivedByAdmin && (
          <ConfirmDropOutForm
            handleConfirmDropoutCandidacy={handleConfirmDropoutCandidacy}
          />
        )}
      </>
    );
  }

  if (!canDropout) {
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
      <p className="m-0">
        Si vous déclarez l’abandon du candidat, il ne pourra plus déposer de
        dossier sur le même diplôme durant cette année civile. Le candidat devra
        valider l’abandon depuis son espace ou, sans réponse sous 6 mois, il
        sera automatiquement acté.
      </p>
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
      <h1 className="text-dsfrBlack-500 text-4xl m-0">Abandon du candidat</h1>

      <CandidacyDropoutComponent
        candidacy={candidacy}
        activeDropoutReasons={activeDropoutReasons}
      />
    </div>
  );
};

export default CandidacyDropoutPage;
