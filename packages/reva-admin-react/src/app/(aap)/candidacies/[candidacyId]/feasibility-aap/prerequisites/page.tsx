"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
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
  prerequisites: z.array(
    z.object({
      id: z.string().optional().nullable(),
      label: sanitizedText(),
      state: z
        .enum(["ACQUIRED", "IN_PROGRESS"], {
          message: "Merci de sélectionner une réponse",
        })
        .optional(),
      certificationPrerequisiteId: z.string().optional().nullable(),
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
    createOrUpdatePrerequisitesMutation,
    isLoadingPrerequisites,
    prerequisitesPartComplete,
  } = usePrerequisites();
  const defaultValues: PrerequisitesFormData = useMemo(() => {
    return {
      prerequisites:
        (candidacyPrerequisites as PrerequisitesFormData["prerequisites"]) ??
        [],
    };
  }, [candidacyPrerequisites]);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
  } = useForm<PrerequisitesFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const prerequisites = watch("prerequisites");
  const hasNoPrerequisites = prerequisites.length === 0;
  const undefinedPrerequisites = prerequisites.some((p) => !p.state);
  const formIsValid = !undefinedPrerequisites || hasNoPrerequisites;
  const canSubmit =
    (isDirty ||
      prerequisites.length !== defaultValues.prerequisites.length ||
      hasNoPrerequisites) &&
    formIsValid;
  const handleFormSubmit = handleSubmit(async (data) => {
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

  if (isLoadingPrerequisites) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <h1>Pré-requis obligatoires</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Un pré-requis obligatoire est une condition exigée par le certificateur
        afin que le candidat puisse passer devant le jury ou recevoir le
        parchemin lié à la certification. Certains pré-requis peuvent être
        renseignés par le certificateur. Vous pouvez tout de même en ajouter si
        cela vous semble utile, pertinent... etc
      </p>
      <p className=" mb-2">
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
        {hasNoPrerequisites ? (
          <Alert
            className="mt-8 mb-8"
            severity="info"
            description="Le certificateur n’a transmis aucun pré-requis obligatoire."
            small
            data-test="no-prerequisites-message"
          />
        ) : (
          <p className="mt-4">
            Le candidat est-il détenteur des pré-requis exigés ?
          </p>
        )}
        <div>
          {prerequisites?.map(
            ({ state, certificationPrerequisiteId }, index) => (
              <PrerequisiteInput
                key={index}
                register={register}
                index={index}
                readonly={!!certificationPrerequisiteId}
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
            ),
          )}
        </div>
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
          <span className="text-sm font-medium">Ajouter un pré-requis</span>
        </div>
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
          formState={{
            isDirty:
              isDirty || (hasNoPrerequisites && !prerequisitesPartComplete),
            isSubmitting,
            canSubmit,
          }}
        />
      </form>
    </div>
  );
}
