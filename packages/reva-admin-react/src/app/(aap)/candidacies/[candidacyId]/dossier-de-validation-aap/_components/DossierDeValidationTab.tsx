import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const dossierDeValidationSchema = z.object({
  dossierDeValidationChecked: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher la case",
    }),
  }),
  dossierDeValidationFile: z.object({
    0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
  }),

  dossierDeValidationOtherFiles: z
    .object({
      0: z.undefined().or(z.instanceof(File)),
    })
    .array(),
});

export type DossierDeValidationFormData = z.infer<
  typeof dossierDeValidationSchema
>;

export const DossierDeValidationTab = ({
  dossierDeValidationIncomplete,
  dossierDeValidationSentAt,
  dossierDeValidationProblems,
  onFormSubmit,
}: {
  dossierDeValidationIncomplete?: boolean;
  dossierDeValidationSentAt?: Date;
  dossierDeValidationProblems: {
    decisionSentAt: Date;
    decisionComment: string;
  }[];
  onFormSubmit: (data: DossierDeValidationFormData) => Promise<void>;
}) => {
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DossierDeValidationFormData>({
    resolver: zodResolver(dossierDeValidationSchema),
    shouldUnregister: true,
    defaultValues: { dossierDeValidationOtherFiles: [{}] },
  });

  const {
    fields: dossierDeValidationOtherFilesFields,
    insert: insertDossierDeValidationOtherFiles,
    remove: removeDossierDeValidationOtherFiles,
  } = useFieldArray({
    name: "dossierDeValidationOtherFiles",
    control,
  });

  const handleReset = useCallback(() => {
    reset({ dossierDeValidationOtherFiles: [{}] });
  }, [reset]);

  const handleFormSubmit = handleSubmit(onFormSubmit);
  return (
    <form
      className="flex flex-col flex-1 mb-2 overflow-auto"
      onSubmit={handleFormSubmit}
      onReset={(e) => {
        e.preventDefault();
        handleReset();
      }}
    >
      <p>
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <p>
        Le dossier de validation doit être rédigé par le candidat. Des pièces
        supplémentaires peuvent être ajoutées selon les attendus du
        certificateur (ex : attestation de premiers secours).
      </p>
      {dossierDeValidationIncomplete && (
        <>
          <Alert
            severity="error"
            title="Dossier de validation signalé par le certificateur"
            description="Ce dossier de validation a été signalé comme comportant des erreurs par le certificateur. Les détails du signalement sont disponibles ci-dessous. Merci de retourner rapidement un dossier valide."
          />
          <p className="mt-8">
            <strong>
              Dossier envoyé le :{" "}
              {format(dossierDeValidationSentAt || 0, "dd/MM/yyyy")}
            </strong>
          </p>
          <ul className="flex flex-col gap-6 mb-6">
            {dossierDeValidationProblems.map((p, i) => (
              <GrayCard key={i}>
                <dl>
                  <dt className="font-bold text-xl">Dossier signalé :</dt>
                  <dd>
                    Dossier signalé le {format(p.decisionSentAt, "dd/MM/yyyy")}
                  </dd>
                  <br />
                  <dt className="font-bold text-xl">Motif du signalement :</dt>
                  <dd>{p.decisionComment}</dd>
                </dl>
              </GrayCard>
            ))}
          </ul>
        </>
      )}
      <hr />
      <div className="flex flex-col gap-6 mb-12">
        <FancyUpload
          title="Joindre le dossier de validation"
          hint="Format supporté : PDF uniquement avec un poids maximum de 10Mo"
          nativeInputProps={{
            ...register("dossierDeValidationFile"),
            accept: ".pdf",
          }}
          state={errors.dossierDeValidationFile ? "error" : "default"}
          stateRelatedMessage={errors.dossierDeValidationFile?.[0]?.message}
        />
        {dossierDeValidationOtherFilesFields.map((d, i) => (
          <FancyUpload
            key={d.id}
            title="Joindre des pièces supplémentaires (optionnel)"
            hint="Format supporté : PDF uniquement avec un poids maximum de 10Mo"
            nativeInputProps={{
              ...register(`dossierDeValidationOtherFiles.${i}`, {
                onChange: (e) => {
                  if (e.target.value) {
                    //if the file input has a value and it was the last empty one we add another empty file input
                    if (i == dossierDeValidationOtherFilesFields.length - 1) {
                      insertDossierDeValidationOtherFiles(
                        dossierDeValidationOtherFilesFields.length,
                        [{}],
                      );
                    }
                  } else {
                    removeDossierDeValidationOtherFiles(i);
                  }
                },
              }),
              accept: ".pdf",
            }}
            state={
              errors.dossierDeValidationOtherFiles?.[i] ? "error" : "default"
            }
            stateRelatedMessage={
              errors.dossierDeValidationOtherFiles?.[i]?.message
            }
          />
        ))}
      </div>
      <Checkbox
        legend="Avant de finaliser l' envoi :"
        options={[
          {
            label:
              "J’ai bien vérifié que le dossier de validation était complet, signé et lisible.",
            nativeInputProps: { ...register("dossierDeValidationChecked") },
          },
        ]}
        state={errors.dossierDeValidationChecked ? "error" : "default"}
        stateRelatedMessage={errors.dossierDeValidationChecked?.message}
        className="mr-0"
      />
      <FormButtons
        formState={{ isDirty, isSubmitting }}
        submitButtonLabel="Enregistrer et envoyer"
      />
    </form>
  );
};
