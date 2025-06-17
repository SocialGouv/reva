"use client";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { graphqlErrorToast } from "@/components/toast/toast";
import { JuryResult } from "@/graphql/generated/graphql";

import { useJuryPageLogic } from "./juryPageLogic";
import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";
import { ResultatCard } from "./ResultatCard";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { HistoryResultatView } from "./HistoryResultatView";
import { useAuth } from "@/components/auth/auth";

const modal = createModal({
  id: "confirm-result",
  isOpenedByDefault: false,
});

const revokeModal = createModal({
  id: "revoke-jury-decision",
  isOpenedByDefault: false,
});

const juryResultLabels: { [key in JuryResult]: string } = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite totale à une certification visée en totalité",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite partielle à une certification visée en totalité",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite totale aux blocs de compétences visés",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite partielle aux blocs de compétences visés",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION:
    "Réussite partielle (sous reserve de confirmation par un certificateur)",
  FAILURE: "Non validation",
  CANDIDATE_EXCUSED: "Candidat excusé sur justificatif",
  CANDIDATE_ABSENT: "Candidat non présent",
};

const juryResultNotice: {
  [key in JuryResult]: "info" | "new" | "success" | "error";
} = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "info",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "info",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION: "info",
  FAILURE: "error",
  CANDIDATE_EXCUSED: "new",
  CANDIDATE_ABSENT: "new",
};

const schema = z.object({
  result: z.enum([
    "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ]),
  informationOfResult: z.string().optional(),
});

type ResultatFormData = z.infer<typeof schema>;

const revokeSchema = z.object({
  reason: z.string().optional(),
});

type RevokeFormData = z.infer<typeof revokeSchema>;

export const Resultat = () => {
  const { getCandidacy, updateJuryResult, revokeJuryDecision } =
    useJuryPageLogic();
  const { isAdmin } = useAuth();
  const availableResultOptions = [
    "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  const candidacy = getCandidacy.data?.getCandidacyById;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResultatFormData>({ resolver: zodResolver(schema) });

  const {
    register: revokeRegister,
    handleSubmit: handleRevokeSubmit,
    formState: { isSubmitting: isRevokeSubmitting },
    reset: resetRevokeForm,
  } = useForm<RevokeFormData>({ resolver: zodResolver(revokeSchema) });

  const handleFormSubmit = handleSubmit(() => {
    modal.open();
  });

  const formData = getValues();

  const submitData = async () => {
    modal.close();

    if (candidacy?.jury?.id) {
      try {
        await updateJuryResult.mutateAsync({
          juryId: candidacy.jury.id,
          input: {
            result: formData.result,
            informationOfResult: formData.informationOfResult,
          },
        });
      } catch (error) {
        console.error(error);
        graphqlErrorToast(error);
      }
    }
  };

  const handleRevokeDecision = handleRevokeSubmit(async (data) => {
    if (candidacy?.jury?.id) {
      try {
        await revokeJuryDecision.mutateAsync({
          juryId: candidacy.jury.id,
          reason: data.reason,
        });
        revokeModal.close();
        resetRevokeForm();
      } catch (error) {
        graphqlErrorToast(error);
      }
    }
  });

  if (getCandidacy.isLoading || !candidacy) {
    return null;
  }

  const jury = candidacy?.jury;
  const historyJury = candidacy?.historyJury;

  const result = jury?.result;

  const editable = candidacy?.jury
    ? isAfter(new Date(), startOfDay(candidacy?.jury.dateOfSession)) && !result
    : false;

  return (
    <>
      <h3>Résultat suite au passage devant le jury</h3>

      <div className="flex flex-col gap-10">
        {!result && (
          <p className="m-0 text-gray-600">
            Sélectionnez le résultat à communiquer par e-mail au candidat et à
            l’AAP. Vous devrez également envoyer un document officiel au
            candidat.
          </p>
        )}

        {historyJury && (
          <HistoryResultatView
            historyJury={historyJury.map((jury) => ({
              id: jury.id,
              dateOfSession: jury.dateOfSession,
              // Only jury with result are in jury history
              result: jury.result!,
              informationOfResult: jury.informationOfResult,
            }))}
          />
        )}

        {!getCandidacy.isLoading && result && (
          <>
            <ResultatCard
              jury={{
                id: jury.id,
                dateOfSession: jury.dateOfSession,
                result: result,
                informationOfResult: jury.informationOfResult,
              }}
            />

            {isAdmin && (
              <div className="flex justify-end">
                <Button priority="secondary" onClick={() => revokeModal.open()}>
                  Annuler la décision
                </Button>
              </div>
            )}

            {jury.result != "FULL_SUCCESS_OF_FULL_CERTIFICATION" &&
              jury.result != "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION" && (
                <CallOut title="Le candidat peut renvoyer un dossier de validation">
                  Suite à ce résultat, le candidat peut repasser devant le jury.
                  Il devra, en amont, retravailler sur son dossier de validation
                  et vous le renvoyer. Une fois reçu, vous pourrez lui
                  transmettre une nouvelle date de passage devant le jury.
                </CallOut>
              )}
          </>
        )}

        {!getCandidacy.isLoading && !result && (
          <form onSubmit={handleFormSubmit}>
            <RadioButtons
              legend="Résultats possibles :"
              small
              hintText={
                isAdmin
                  ? "Sous réserve de contre remplissage par le certificateur."
                  : ""
              }
              className="m-0 p-0 mb-4"
              options={availableResultOptions.map((key) => {
                const label = juryResultLabels[key as JuryResult];

                return {
                  label,
                  nativeInputProps: {
                    value: key,
                    ...register("result"),
                    disabled: !editable,
                  },
                };
              })}
              state={errors.result ? "error" : "default"}
              stateRelatedMessage={
                errors.result ? "Veuillez sélectionner une option" : undefined
              }
            />

            <Input
              label="Commentaires (optionnel) :"
              nativeTextAreaProps={register("informationOfResult")}
              textArea
              hintText="Indiquer ici toutes les réserves, consignes ou attendus éventuels."
              disabled={!editable}
            />

            <div className="flex flex-row items-end">
              <Button
                className="ml-auto mt-8 text-right"
                disabled={isSubmitting || !isValid || !editable}
              >
                Envoyer
              </Button>
            </div>
          </form>
        )}

        <>
          <modal.Component
            title="Confirmer le choix du résultat"
            className="modal-confirm-jury-result"
            buttons={[
              {
                priority: "secondary",
                children: "Modifier",
              },
              {
                priority: "primary",
                onClick: submitData,
                children: "Confirmer",
              },
            ]}
          >
            <div className="flex flex-col gap-4">
              <h5 className="text-base font-bold mt-4">
                {`${format(new Date(), "dd/MM/yyyy")} - Résultat :`}
              </h5>

              {juryResultNotice[formData.result] == "error" ? (
                <CustomErrorBadge label={juryResultLabels[formData.result]} />
              ) : (
                <Badge severity={juryResultNotice[formData.result]}>
                  {juryResultLabels[formData.result]}
                </Badge>
              )}

              {formData?.informationOfResult && (
                <label className="text-base">
                  {`“${formData.informationOfResult}”`}
                </label>
              )}
            </div>
          </modal.Component>

          <revokeModal.Component
            title={
              <div className="flex gap-2">
                <span
                  className="fr-icon--lg fr-icon-warning-fill"
                  aria-hidden="true"
                />
                Annuler une décision prise par un certificateur.
              </div>
            }
            buttons={[
              {
                priority: "secondary",
                children: "Retour",
              },
              {
                priority: "primary",
                onClick: handleRevokeDecision,
                children: "Confirmer",
                disabled: isRevokeSubmitting,
              },
            ]}
            size="large"
          >
            <p>
              Vous êtes sur le point d'annuler une décision prise par un
              certificateur. Cette action l'obligera à prononcer sa décision de
              nouveau. Vous ne pourrez pas prendre de décision définitive à sa
              place.
            </p>
            <Input
              label="Commentaire : (Optionnel)"
              nativeTextAreaProps={{ rows: 3, ...revokeRegister("reason") }}
              textArea
            />
            <p>Voulez vous confirmer l'annulation de cette décision ?</p>
          </revokeModal.Component>
        </>
      </div>
    </>
  );
};
