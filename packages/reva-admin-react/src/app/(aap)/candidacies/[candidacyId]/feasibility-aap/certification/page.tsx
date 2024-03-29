"use client";
import { useCertificationPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/certification/certificationPageLogic";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  competenceBlocs: z
    .object({
      id: z.string(),
      label: z.string(),
      checked: z.boolean(),
    })
    .array(),
});

type FormData = z.infer<typeof schema>;

const CertificationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { certification } = useCertificationPageLogic();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields: competenceBlocFields } = useFieldArray({
    control,
    name: "competenceBlocs",
  });

  const resetForm = useCallback(
    () =>
      reset({
        competenceBlocs: certification?.competenceBlocs.map((b) => ({
          id: b.id,
          label: b.code ? `${b.code} - ${b.label}` : b.label,
          checked: false,
        })),
      }),
    [certification?.competenceBlocs, reset],
  );

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log({ data });
    },
    (e) => console.log(e),
  );

  return (
    <div className="flex flex-col">
      <h1>Descriptif de la certification</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-10">
        Choisissez les blocs de compétences sur lesquels le candidat souhaite se
        positionner
      </p>
      <div className="flex gap-2">
        <span className="fr-icon fr-icon--lg fr-icon-award-fill" />
        <div className="flex flex-col">
          <p className="text-xl font-bold mb-0">{certification?.label}</p>
          <p className="text-sm text-dsfr-light-text-mention-grey">
            RNCP {certification?.codeRncp}
          </p>
        </div>
      </div>
      <a
        href={`https://www.francecompetences.fr/recherche/rncp/${certification?.codeRncp}/`}
        target="_blank"
        className="fr-link mr-auto"
      >
        Lire les détails de la fiche diplôme
      </a>
      {certification && (
        <form className="mt-6" onSubmit={handleFormSubmit}>
          <Checkbox
            legend={
              <span className="text-xl font-bold">
                Bloc(s) de compétence visé(s)
              </span>
            }
            options={competenceBlocFields.map((b, bIndex) => ({
              label: b.label,
              nativeInputProps: {
                ...register(`competenceBlocs.${bIndex}.checked`),
              },
            }))}
          />
          <FormButtons
            backUrl={`/candidacies/${candidacyId}}/feasibility-aap/certification`}
            formState={{ isDirty, isSubmitting }}
          />
        </form>
      )}
    </div>
  );
};

export default CertificationPage;
