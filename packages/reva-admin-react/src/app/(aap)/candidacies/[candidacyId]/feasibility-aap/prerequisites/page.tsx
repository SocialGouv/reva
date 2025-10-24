"use client";

import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import type { PrerequisiteInput as PrerequisiteInputType } from "@/graphql/generated/graphql";

import { PrerequisiteInput } from "./_components/PrerequisiteInput";
import { usePrerequisites } from "./_components/prerequisites.hook";

const schema = z.object({
  hasNoPrerequisites: z.boolean(),
  prerequisites: z.array(
    z.object({
      id: z.string().optional(),
      label: sanitizedText(),
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
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;
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
        message: "Vous devez cocher la case si aucun prérequis n'est requis",
      });
      return;
    }
    try {
      await createOrUpdatePrerequisitesMutation({
        prerequisites: data.prerequisites as PrerequisiteInputType[],
      });
      successToast("Modifications enregistrées");
      router.push(feasibilitySummaryUrl);
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
      <h1>Prérequis obligatoires</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Un prérequis obligatoire est une condition exigée par le certificateur
        afin que le candidat puisse passer devant le jury VAE ou recevoir le
        parchemin lié à la certification.
      </p>
      <p className="text-xl font-bold text-neutral-900 mb-2">
        Retrouvez plus d’informations sur le fonctionnement des certifications
        dans notre{" "}
        <a
          target="_blank"
          href="https://fabnummas.notion.site/Ressources-documentaires-d-tails-des-certifications-trame-de-dossier-de-validation-9d8ae84eb82044b585d769c84676615d"
        >
          espace documentaire
        </a>
        .
      </p>
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
              label: "Il n'y a pas de prérequis pour cette certification.",
              nativeInputProps: {
                ...{ "data-test": "has-no-prerequisites-checkbox-input" },
                ...register("hasNoPrerequisites"),
                onChange: handleCheckboxChange,
              },
            },
          ]}
          data-test="has-no-prerequisites-checkbox"
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
              data-test="add-prerequisite-button"
            >
              <span className="fr-icon-add-line fr-icon--sm" />
              <span className="text-sm">Ajouter un prérequis</span>
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
