"use client";
import { useCertificationPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/certification/certificationPageLogic";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  option: z.string(),
  firstForeignLanguage: z.string(),
  secondForeignlanguage: z.string(),
  completion: z.enum(["PARTIAL", "COMPLETE"], {
    invalid_type_error: "Ce champ est obligatoire",
  }),
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
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields: competenceBlocFields, update: updateCompetenceBlocs } =
    useFieldArray({
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

  const completion = useWatch({ name: "completion", control });

  useEffect(() => {
    switch (completion) {
      case "COMPLETE": {
        if (competenceBlocFields.some((cbf) => !cbf.checked)) {
          competenceBlocFields.forEach((cbf, i) =>
            updateCompetenceBlocs(i, { ...cbf, checked: true }),
          );
        }
        break;
      }
      case "PARTIAL": {
        if (competenceBlocFields.some((cbf) => cbf.checked)) {
          competenceBlocFields.forEach((cbf, i) =>
            updateCompetenceBlocs(i, { ...cbf, checked: false }),
          );
        }
        break;
      }
    }
  }, [competenceBlocFields, completion, updateCompetenceBlocs]);

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
          <Input
            label="Option ou parcours"
            hintText="(le cas échéant)"
            nativeInputProps={{ ...register("option") }}
          />
          <SmallNotice>
            Toutes les informations sur les options et parcours sont sur
            l’espace documentaire
          </SmallNotice>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <Input
              label="Langue vivante 1"
              hintText="(Optionnel)"
              nativeInputProps={{ ...register("firstForeignLanguage") }}
            />
            <Input
              label="Langue vivante 2"
              hintText="(Optionnel)"
              nativeInputProps={{ ...register("secondForeignlanguage") }}
            />
          </div>

          <RadioButtons
            className="mb-6"
            legend="Le candidat / la candidate vise :"
            options={[
              {
                label: "La certification dans sa totalité",
                nativeInputProps: {
                  value: "COMPLETE",
                  ...register("completion"),
                },
              },
              {
                label:
                  "Un ou plusieurs bloc(s) de compétences de la certification",
                nativeInputProps: {
                  value: "PARTIAL",
                  ...register("completion"),
                },
              },
            ]}
            state={errors.completion ? "error" : "default"}
            stateRelatedMessage={errors.completion?.message}
          />

          <Checkbox
            legend={
              <span className="text-xl font-bold">
                Bloc(s) de compétence visé(s)
              </span>
            }
            disabled={!completion}
            options={competenceBlocFields.map((b, bIndex) => ({
              label: b.label,
              nativeInputProps: {
                key: competenceBlocFields[bIndex].id,
                ...register(`competenceBlocs.${bIndex}.checked`),
              },
            }))}
          />
          <FormButtons
            backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
            formState={{ isDirty, isSubmitting }}
          />
        </form>
      )}
    </div>
  );
};

export default CertificationPage;