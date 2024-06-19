import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

const dossierDeValidationSchema = z.object({
  dossierDeValidationChecked: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher la case",
    }),
  }),
  dossierDeValidationFile: z.object({
    0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
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
  onFormSubmit,
}: {
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
                    insertDossierDeValidationOtherFiles(
                      dossierDeValidationOtherFilesFields.length,
                      [{}],
                    );
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
              "J’ai bien vérifié que le dossier de validation était complet et lisible.",
            nativeInputProps: { ...register("dossierDeValidationChecked") },
          },
        ]}
        state={errors.dossierDeValidationChecked ? "error" : "default"}
        stateRelatedMessage={errors.dossierDeValidationChecked?.message}
      />
      <FormButtons formState={{ isDirty, isSubmitting }} />
    </form>
  );
};
