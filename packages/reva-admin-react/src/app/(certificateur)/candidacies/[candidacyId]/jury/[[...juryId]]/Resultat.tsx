"use client";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format, isAfter, startOfDay } from "date-fns";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

import { JuryResult } from "@/graphql/generated/graphql";
import { errorToast } from "@/components/toast/toast";

import { useJuryPageLogic } from "./juryPageLogic";

const modal = createModal({
  id: "confirm-result",
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
  FAILURE: "Non validation",
  CANDIDATE_EXCUSED: "Candidat excusé sur justificatif",
  CANDIDATE_ABSENT: "Candidat non présent",
};

const isResultProvisionalEnabled = (result: JuryResult): boolean => {
  const authorizedValues = [
    "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  ];

  const enabled = authorizedValues.indexOf(result) != -1;

  return enabled;
};

const juryResultNotice: {
  [key in JuryResult]: "info" | "new" | "success" | "error";
} = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "info",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "info",
  FAILURE: "error",
  CANDIDATE_EXCUSED: "new",
  CANDIDATE_ABSENT: "new",
};

const schema = z
  .object({
    result: z.enum([
      "FULL_SUCCESS_OF_FULL_CERTIFICATION",
      "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
      "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      "FAILURE",
      "CANDIDATE_EXCUSED",
      "CANDIDATE_ABSENT",
    ]),
    isResultProvisional: z.enum(["true", "false"]).nullable(),
    informationOfResult: z.string().optional(),
  })
  .refine(
    ({ result, isResultProvisional }) =>
      !(isResultProvisionalEnabled(result) && isResultProvisional == null),
  );

type ResultatFormData = z.infer<typeof schema>;

export const Resultat = (): JSX.Element => {
  const { getCandidacy, updateJuryResult } = useJuryPageLogic();

  const candidacy = getCandidacy.data?.getCandidacyById;

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResultatFormData>({ resolver: zodResolver(schema) });

  const handleFormSubmit = handleSubmit(() => {
    modal.open();
  });

  const formData = getValues();

  const watchResult = watch("result");

  const submitData = async () => {
    modal.close();

    if (candidacy?.jury?.id) {
      try {
        await updateJuryResult.mutateAsync({
          juryId: candidacy.jury.id,
          input: {
            result: formData.result,
            isResultProvisional: formData.isResultProvisional == "true",
            informationOfResult: formData.informationOfResult,
          },
        });
      } catch (error) {
        const errorMessage =
          (error as any)?.response?.errors?.[0]?.message ||
          '"Une erreur est survenue"';

        errorToast(errorMessage);

        console.error(error);
      }
    }
  };

  const result = candidacy?.jury?.result;

  const editable = candidacy?.jury
    ? isAfter(new Date(), startOfDay(candidacy?.jury.dateOfSession)) && !result
    : false;

  return (
    <div className="flex flex-col">
      <>
        <h5 className="text-xl font-bold">
          Résultat à l'issue de l'entretien avec le jury
        </h5>
        {!result && (
          <p className="text-gray-600 mt-4 mb-12">
            Sélectionner l'option de résultat qui convient. Le résultat est
            envoyé par e-mail à l’AAP et au candidat. Un document officiel devra
            être envoyé au candidat.
          </p>
        )}
      </>

      {!getCandidacy.isLoading && result && (
        <div className="flex flex-col gap-4 mt-12">
          <h5 className="text-base font-bold">
            {`${format(candidacy.jury?.dateOfResult || "", "yyyy-MM-dd")} - ${
              candidacy.jury?.isResultProvisional
                ? "Résultat provisoire"
                : "Résultat définitif"
            } :`}
          </h5>

          {juryResultNotice[result] == "error" ? (
            <CustomErrorBadge label={juryResultLabels[result]} />
          ) : (
            <Badge severity={juryResultNotice[result]}>
              {juryResultLabels[result]}
            </Badge>
          )}

          {candidacy.jury?.informationOfResult && (
            <label className="text-base">
              {`“${candidacy.jury.informationOfResult}”`}
            </label>
          )}
        </div>
      )}

      {!getCandidacy.isLoading && !result && (
        <form onSubmit={handleFormSubmit}>
          <RadioButtons
            legend="Résultat"
            className="m-0 p-0 mb-12"
            options={Object.keys(juryResultLabels).map((key) => {
              const label = juryResultLabels[key as JuryResult];

              return {
                label: label,
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

          {(!watchResult || isResultProvisionalEnabled(watchResult)) && (
            <RadioButtons
              legend="Informations complémentaires :"
              className="m-0 p-0 mb-12"
              orientation="horizontal"
              options={[
                {
                  label: "Résultat définitif",
                  nativeInputProps: {
                    value: "false",
                    ...register("isResultProvisional"),
                    disabled: !editable,
                  },
                },
                {
                  label: "Résultat provisoire",
                  nativeInputProps: {
                    value: "true",
                    ...register("isResultProvisional"),
                    disabled: !editable,
                  },
                },
              ]}
              state={errors.isResultProvisional ? "error" : "default"}
              stateRelatedMessage={
                errors.isResultProvisional
                  ? "Veuillez sélectionner une option"
                  : undefined
              }
            />
          )}

          <Input
            label="Annotations (optionnel) :"
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
              {`${format(new Date(), "yyyy-MM-dd")} - ${
                formData.isResultProvisional == "true"
                  ? "Résultat provisoire"
                  : "Résultat définitif"
              } :`}
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
      </>
    </div>
  );
};

const CustomErrorBadge = ({ label }: { label: string }): JSX.Element => (
  <div>
    <div
      className={`text-[#6E445A] bg-[#FEE7FC] inline-flex items-center gap-1 rounded px-1 h-6`}
    >
      <label className={`text-sm font-bold`}>{label.toUpperCase()}</label>
    </div>
  </div>
);
