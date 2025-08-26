import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";

import { ResourcesSection } from "../../ResourcesSection";

const dossierDeValidationSchema = z.object({
  dossierDeValidationCheck1: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher la case",
    }),
  }),
  dossierDeValidationCheck2: z.literal(true, {
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
  dossierDeValidationProblems,
  certification,
  onSubmit,
}: {
  dossierDeValidationIncomplete?: boolean;
  dossierDeValidationProblems: {
    decisionSentAt: Date;
    decisionComment: string;
  }[];
  certification: {
    id: string;
    label: string;
    additionalInfo?: {
      dossierDeValidationTemplate?: {
        previewUrl?: string | null;
      } | null;
      dossierDeValidationLink?: string | null;
    } | null;
  } | null;
  onSubmit: (data: DossierDeValidationFormData) => Promise<void>;
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

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <div className="flex gap-6">
      <main className="flex-1">
        <p className="mb-8">
          Une fois votre dossier de validation complété et relu, vous pouvez le
          transmettre à votre certificateur depuis cette page. Si des pièces
          supplémentaires sont requises (ex : attestation de premiers secours),
          elles seront également à envoyer ici.
        </p>

        {dossierDeValidationIncomplete && (
          <Alert
            data-test="dossier-de-validation-signale-alert"
            severity="warning"
            title="Dossier de validation signalé par le certificateur"
            description={
              <p>
                Ce dossier de validation a été signalé comme comportant des
                erreurs par le certificateur. Les détails du signalement sont
                disponibles ci-dessous.
                <br />
                Merci de retourner rapidement un dossier corrigé.
              </p>
            }
          />
        )}
        {dossierDeValidationIncomplete && (
          <>
            <ul className="flex flex-col gap-8 pl-0">
              {dossierDeValidationProblems.map((p, i) => (
                <GrayCard key={i}>
                  <dl>
                    <dt className="font-bold text-xl">Dossier signalé :</dt>
                    <dd>
                      Dossier signalé le{" "}
                      {format(p.decisionSentAt, "dd/MM/yyyy")}
                    </dd>
                    <br />
                    <dt className="font-bold text-xl">
                      Motif du signalement :
                    </dt>
                    <dd>{p.decisionComment}</dd>
                  </dl>
                </GrayCard>
              ))}
            </ul>
            <hr className="mt-8 mb-5" />
          </>
        )}
        <form
          className="flex flex-col flex-1 mb-2 overflow-auto"
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <div className="flex flex-col gap-6 mb-12">
            <FancyUpload
              className="dossier-de-validation-file-upload"
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
                        if (
                          i ==
                          dossierDeValidationOtherFilesFields.length - 1
                        ) {
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
                  errors.dossierDeValidationOtherFiles?.[i]
                    ? "error"
                    : "default"
                }
                stateRelatedMessage={
                  errors.dossierDeValidationOtherFiles?.[i]?.message
                }
              />
            ))}
          </div>
          <Checkbox
            className="mr-0"
            legend="Avez-vous bien vérifié ces éléments avant l’envoi ?"
            data-test="dossier-de-validation-checkbox-group"
            options={[
              {
                label:
                  "Mon dossier de validation est correct, complet et signé.",
                nativeInputProps: { ...register("dossierDeValidationCheck1") },
              },
              {
                label: "Mes pièces supplémentaires sont valides et lisibles.",
                nativeInputProps: { ...register("dossierDeValidationCheck2") },
              },
            ]}
            state={
              errors.dossierDeValidationCheck1 ||
              errors.dossierDeValidationCheck2
                ? "error"
                : "default"
            }
            stateRelatedMessage={
              errors.dossierDeValidationCheck1?.message ||
              errors.dossierDeValidationCheck2?.message
            }
          />
          <Button
            type="submit"
            className="ml-auto"
            disabled={!isDirty || isSubmitting}
            data-test="submit-dossier-de-validation-form-button"
          >
            Envoyer les documents
          </Button>
        </form>
      </main>

      <ResourcesSection certification={certification} />
    </div>
  );
};
