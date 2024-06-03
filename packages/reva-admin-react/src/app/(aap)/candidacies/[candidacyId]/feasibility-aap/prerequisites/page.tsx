"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  hasNoPrerequisites: z.boolean(),
  prerequisites: z.array(
    z.object({
      label: z.string().min(1, "Ce champ est obligatoire"),
      state: z.enum(["ACQUIRED", "IN_PROGRESS", "RECOMMENDED"]).optional(),
    }),
  ),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  hasNoPrerequisites: false,
  prerequisites: [{ label: "", state: undefined }],
};

export default function PrerequisitesPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const hasNoPrerequisites = watch("hasNoPrerequisites");
  const prerequisites = watch("prerequisites");
  const undefinedPrerequisites = prerequisites.some((p) => !p.state);

  const formIsValid = !undefinedPrerequisites || hasNoPrerequisites;
  const canSubmit =
    (isDirty ||
      watch("prerequisites").length !== defaultValues.prerequisites.length) &&
    formIsValid;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      console.log("data", data);
      successToast("Modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const resetForm = useCallback(() => reset(defaultValues), [reset]);

  useEffect(resetForm, [resetForm]);

  return (
    <div className="flex flex-col">
      <h1>Pré-requis</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Renseignez les pré-requis liés à l'entrée en VAE et à la certification.
      </p>
      <p className="text-xl font-bold mb-0">Rajouter le lien espace docu ici</p>
      <form
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <Checkbox
          className="my-8"
          options={[
            {
              label: "Il n'y a pas de pré-requis pour cette certification.",
              nativeInputProps: {
                ...register("hasNoPrerequisites"),
                onChange: (e) => {
                  if (e.target.checked) {
                    setValue("prerequisites", []);
                  }
                  setValue("hasNoPrerequisites", e.target.checked);
                },
              },
            },
          ]}
        />
        {!hasNoPrerequisites && (
          <div>
            {prerequisites?.map(({ state }, index) => (
              <PrerequisiteInput
                key={index}
                register={register}
                index={index}
                onDelete={() => {
                  setValue(
                    "prerequisites",
                    prerequisites.filter((_, i) => i !== index),
                  );
                }}
                errorLabel={errors.prerequisites?.[index]?.label?.message}
                errorState={
                  state && errors.prerequisites?.[index]?.state?.message
                }
              />
            ))}
            <div
              className="flex cursor-pointer gap-2 text-blue-900 items-center"
              onClick={() => {
                setValue(
                  "prerequisites",
                  [...(prerequisites ?? []), { label: "", state: undefined }],
                  { shouldDirty: true },
                );
              }}
            >
              <span className="fr-icon-add-line fr-icon--sm" />
              <span className="text-sm">Ajouter un pré-requis</span>
            </div>
          </div>
        )}
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
          formState={{
            isDirty,
            isSubmitting,
            canSubmit,
          }}
        />
      </form>
    </div>
  );
}

const PrerequisiteInput = ({
  register,
  index,
  onDelete,
  errorLabel,
  errorState,
}: {
  register: UseFormRegister<FormData>;
  index: number;
  onDelete: () => void;
  errorLabel?: string;
  errorState?: string;
}) => {
  return (
    <div>
      <Input
        label="Intitulé du pré-requis :"
        nativeTextAreaProps={register(`prerequisites.${index}.label`)}
        state={errorLabel ? "error" : "default"}
        stateRelatedMessage={errorLabel}
        textArea
      />
      <div className="flex justify-between my-4">
        <RadioButtons
          className="m-0"
          orientation="horizontal"
          state={errorState ? "error" : "default"}
          stateRelatedMessage={errorState}
          options={[
            {
              label: "Acquis",
              nativeInputProps: {
                value: "ACQUIRED",
                ...register(`prerequisites.${index}.state`),
              },
            },
            {
              label: "En cours d'obtention",

              nativeInputProps: {
                value: "IN_PROGRESS",
                ...register(`prerequisites.${index}.state`),
              },
            },
            {
              label: "À préconiser",
              nativeInputProps: {
                value: "RECOMMENDED",
                ...register(`prerequisites.${index}.state`),
              },
            },
          ]}
          small
        />
        <div
          className="flex gap-2 cursor-pointer text-blue-900 items-center"
          onClick={onDelete}
        >
          <span className="fr-icon-delete-bin-line fr-icon--sm" />
          <span className="text-sm font-medium">Supprimer</span>
        </div>
      </div>
      <hr className="my-4" />
    </div>
  );
};
