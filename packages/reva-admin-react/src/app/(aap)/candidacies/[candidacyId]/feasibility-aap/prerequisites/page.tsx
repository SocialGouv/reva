"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedTextAllowSpecialCharacters } from "@/utils/input-sanitization";

import type { PrerequisiteInput as PrerequisiteInputType } from "@/graphql/generated/graphql";

import { CertificationPrerequisiteInput } from "./_components/CertificationPrerequisiteInput";
import { PrerequisiteInput } from "./_components/PrerequisiteInput";
import { usePrerequisites } from "./_components/prerequisites.hook";

const schema = z.object({
  aapPrerequisites: z.array(
    z.object({
      id: z.string().uuid().optional().nullable(),
      label: sanitizedTextAllowSpecialCharacters(),
      state: z
        .enum(["ACQUIRED", "IN_PROGRESS"], {
          message: "Merci de sélectionner une réponse",
        })
        .optional(),
    }),
  ),
  certificationPrerequisites: z.array(
    z.object({
      id: z.string().uuid().optional().nullable(),
      label: sanitizedTextAllowSpecialCharacters(),
      state: z
        .enum(["ACQUIRED", "IN_PROGRESS"], {
          message: "Merci de sélectionner une réponse",
        })
        .optional(),
      certificationPrerequisiteId: z.string().uuid(),
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
    prerequisites: dffPrerequisites,
    createOrUpdatePrerequisitesMutation,
    isLoadingPrerequisites,
    prerequisitesPartComplete,
  } = usePrerequisites();
  const defaultValues: PrerequisitesFormData = useMemo(() => {
    return {
      aapPrerequisites:
        (dffPrerequisites?.filter(
          (p) => p?.certificationPrerequisiteId === null,
        ) as PrerequisitesFormData["aapPrerequisites"]) ?? [],
      certificationPrerequisites:
        (dffPrerequisites?.filter(
          (p) => p?.certificationPrerequisiteId !== null,
        ) as PrerequisitesFormData["certificationPrerequisites"]) ?? [],
    };
  }, [dffPrerequisites]);
  const {
    register,
    watch,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
    control,
  } = useForm<PrerequisitesFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    fields: aapPrerequisitesFields,
    append: appendAapPrerequisite,
    remove: removeAapPrerequisite,
  } = useFieldArray({
    control,
    name: "aapPrerequisites",
  });
  const { fields: certificationPrerequisitesFields } = useFieldArray({
    control,
    name: "certificationPrerequisites",
  });

  const aapPrerequisites = watch("aapPrerequisites");
  const certificationPrerequisites = watch("certificationPrerequisites");

  const hasNoCertificationPrerequisites =
    certificationPrerequisites.length === 0;

  const undefinedAapPrerequisites = aapPrerequisites.some((p) => !p.state);
  const undefinedCertificationPrerequisites = certificationPrerequisites.some(
    (p) => !p.state,
  );
  const formIsValid =
    !undefinedAapPrerequisites && !undefinedCertificationPrerequisites;
  const canSubmit =
    (isDirty ||
      aapPrerequisites.length !== defaultValues.aapPrerequisites.length ||
      certificationPrerequisites.length !==
        defaultValues.certificationPrerequisites.length ||
      hasNoCertificationPrerequisites) &&
    formIsValid;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const dataToSubmit = [
        ...data.aapPrerequisites,
        ...data.certificationPrerequisites,
      ];
      await createOrUpdatePrerequisitesMutation({
        prerequisites: dataToSubmit as PrerequisiteInputType[],
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
        {hasNoCertificationPrerequisites ? (
          <Alert
            className="mt-8 mb-8"
            severity="info"
            description="Le certificateur n’a transmis aucun pré-requis obligatoire."
            small
            data-testid="no-prerequisites-message"
          />
        ) : (
          <div className="flex flex-col gap-4 p-6 pb-4 border border-dsfr-light-decisions-border-border-default-grey mt-8 mb-4">
            <p className="text-lg font-bold m-0 text-dsfrGray-titleGrey border-b border-dsfr-light-decisions-border-border-default-grey pb-6">
              Pré-requis obligatoires renseignés par le certificateur :
            </p>
            {certificationPrerequisitesFields?.map(({ label }, index) => (
              <CertificationPrerequisiteInput
                key={index}
                register={register}
                index={index}
                label={label}
                errorLabel={
                  errors.certificationPrerequisites?.[index]?.label?.message
                }
                errorState={
                  errors.certificationPrerequisites?.[index]?.state?.message
                }
              />
            ))}
          </div>
        )}
        <div>
          {aapPrerequisitesFields?.map(({ state }, index) => (
            <PrerequisiteInput
              key={index}
              register={register}
              index={index}
              onDelete={() => {
                removeAapPrerequisite(index);
              }}
              errorLabel={errors.aapPrerequisites?.[index]?.label?.message}
              errorState={
                state && errors.aapPrerequisites?.[index]?.state?.message
              }
            />
          ))}
        </div>
        <div
          className="flex cursor-pointer gap-2 text-blue-900 items-center w-fit"
          onClick={() => {
            appendAapPrerequisite({
              label: "",
              state: undefined,
            });
          }}
          data-testid="add-prerequisite-button"
        >
          <span className="fr-icon-add-line fr-icon--sm" />
          <span className="text-sm font-medium">Ajouter un pré-requis</span>
        </div>
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
          formState={{
            isDirty:
              isDirty ||
              (hasNoCertificationPrerequisites && !prerequisitesPartComplete),
            isSubmitting,
            canSubmit,
          }}
        />
      </form>
    </div>
  );
}
