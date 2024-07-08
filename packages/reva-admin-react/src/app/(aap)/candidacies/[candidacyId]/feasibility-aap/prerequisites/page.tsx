"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import type { PrerequisiteInput as PrerequisiteInputType } from "@/graphql/generated/graphql";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PrerequisiteInput } from "./_components/PrerequisiteInput";
import { usePrerequisites } from "./_components/prerequisites.hook";

const schema = z.object({
  hasNoPrerequisites: z.boolean(),
  prerequisites: z.array(
    z.object({
      id: z.string().optional(),
      label: z.string().min(1, "Merci de remplir ce champ"),
      state: z.enum(["ACQUIRED", "IN_PROGRESS", "RECOMMENDED"]).optional(),
    }),
  ),
});

export type PrerequisitesFormData = z.infer<typeof schema>;

export default function PrerequisitesPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();
  const {
    prerequisites: candidacyPrerequisites,
    prerequisitesPartComplete,
    createOrUpdatePrerequisitesMutation,
    isLoadingPrerequisites,
  } = usePrerequisites();
  const defaultValues: PrerequisitesFormData = useMemo(() => {
    if (prerequisitesPartComplete) {
      return {
        hasNoPrerequisites: !candidacyPrerequisites?.length,
        prerequisites:
          (candidacyPrerequisites as PrerequisitesFormData["prerequisites"]) ??
          [],
      };
    }
    return {
      hasNoPrerequisites: false,
      prerequisites: [{ label: "", state: undefined }],
    };
  }, [candidacyPrerequisites, prerequisitesPartComplete]);
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
  } = useForm<PrerequisitesFormData>({
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
    if (!data.hasNoPrerequisites && !data.prerequisites.length) {
      setError("hasNoPrerequisites", {
        message: "Vous devez cocher la case si aucun pré-requis n'est requis",
      });
      return;
    }
    try {
      await createOrUpdatePrerequisitesMutation({
        prerequisites: data.prerequisites as PrerequisiteInputType[],
      });
      successToast("Modifications enregistrées");
      router.push(`/candidacies/${candidacyId}/feasibility-aap`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const resetForm = useCallback(
    () => reset(defaultValues),
    [reset, defaultValues],
  );

  useEffect(resetForm, [resetForm]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      clearErrors();
      setValue("prerequisites", [], { shouldDirty: true });
    } else {
      setValue("prerequisites", [{ label: "", state: undefined }], {
        shouldDirty: true,
      });
    }
    setValue("hasNoPrerequisites", e.target.checked, {
      shouldDirty: true,
    });
  };

  if (isLoadingPrerequisites) {
    return null;
  }

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
          state={errors.hasNoPrerequisites ? "error" : "default"}
          stateRelatedMessage={errors.hasNoPrerequisites?.message}
          options={[
            {
              label: "Il n'y a pas de pré-requis pour cette certification.",
              nativeInputProps: {
                ...register("hasNoPrerequisites"),
                onChange: handleCheckboxChange,
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
                    { shouldDirty: true },
                  );
                }}
                errorLabel={errors.prerequisites?.[index]?.label?.message}
                errorState={
                  state && errors.prerequisites?.[index]?.state?.message
                }
              />
            ))}
            <div
              className="flex cursor-pointer gap-2 text-blue-900 items-center w-fit"
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
