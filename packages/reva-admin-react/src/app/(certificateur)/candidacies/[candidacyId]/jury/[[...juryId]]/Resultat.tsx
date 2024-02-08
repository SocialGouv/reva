"use client";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format, add } from "date-fns";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { JuryResult } from "@/graphql/generated/graphql";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useJuryPageLogic } from "./juryPageLogic";

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
  isResultProvisional: z.enum(["true", "false"]),
  informationOfResult: z.string().optional(),
});

type ResultatFormData = z.infer<typeof schema>;

export const Resultat = (): JSX.Element => {
  const { candidacy, updateJuryResult } = useJuryPageLogic();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResultatFormData>({ resolver: zodResolver(schema) });

  const handleFormSubmit = handleSubmit((data) => {
    if (candidacy?.jury?.id) {
      updateJuryResult.mutateAsync({
        juryId: candidacy.jury.id,
        input: {
          result: data.result,
          isResultProvisional: data.isResultProvisional == "true",
          informationOfResult: data.informationOfResult,
        },
      });
    }
  });

  const result = candidacy?.jury?.result;

  return (
    <div className="flex flex-col">
      <>
        <h5 className="text-xl font-bold mb-4">
          Résultat à l'issue de l'entretien avec le jury
        </h5>
        {!result && (
          <p className="text-gray-600 mb-12">
            Sélectionner l'option de résultat qui convient. Le résultat est
            envoyé par e-mail à l’AAP et au candidat. Un document officiel devra
            être envoyé au candidat.
          </p>
        )}
      </>

      {result ? (
        <>
          <h5 className="text-base font-bold mb-4">
            {`${format(candidacy.jury?.dateOfSession, "yyyy-MM-dd")} - ${
              candidacy.jury?.isResultProvisional
                ? "Résultat provisoire"
                : "Résultat définitif"
            } :`}
          </h5>

          <label className="text-base bg-[#B8FEC9] mb-4">
            {juryResultLabels[result]}
          </label>

          {candidacy.jury?.informationOfResult && (
            <label className="text-base">
              {`“${candidacy.jury?.informationOfResult}”`}
            </label>
          )}
        </>
      ) : (
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
                },
              };
            })}
            state={errors.result ? "error" : "default"}
            stateRelatedMessage={
              errors.result ? "Veuillez sélectionner une option" : undefined
            }
          />

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
                },
              },
              {
                label: "Résultat provisoire",
                nativeInputProps: {
                  value: "true",
                  ...register("isResultProvisional"),
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

          <Input
            label="Annotations (optionnel) :"
            nativeTextAreaProps={register("informationOfResult")}
            textArea
            hintText="Indiquer ici toutes les réserves, consignes ou attendus éventuels."
          />

          <div className="flex flex-row items-end">
            <Button
              className="ml-auto mt-8 text-right"
              disabled={isSubmitting || !isValid}
            >
              Envoyer
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
