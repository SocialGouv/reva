import Button from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { OTHER_FINANCING_METHOD_ID } from "../trainingPage.hook";
import { Fragment } from "react";

const trainingFormSchema = z.object({
  individualHourCount: z
    .number({
      errorMap: () => ({
        message: "Ce champ doit être un entier supérieur ou égal à zéro",
      }),
    })
    .min(0)
    .max(10000, "La valeur de ce champ est trop élevée"),
  collectiveHourCount: z
    .number({
      errorMap: () => ({
        message: "Ce champ doit être un entier supérieur ou égal à zéro",
      }),
    })
    .min(0)
    .max(10000, "La valeur de ce champ est trop élevée"),
  additionalHourCount: z
    .number({
      errorMap: () => ({
        message: "Ce champ doit être un entier supérieur ou égal à zéro",
      }),
    })
    .min(0)
    .max(10000, "La valeur de ce champ est trop élevée"),

  mandatoryTrainings: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
  basicSkills: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),

  certificateSkills: z.string(),
  otherTraining: z.string(),
  certificationScope: z.enum(["PARTIAL", "COMPLETE"], {
    errorMap: () => ({
      message: "Merci de remplir ce champ",
    }),
  }),
  candidacyFinancingMethods: z
    .object({
      id: z.string(),
      originalId: z.string(),
      label: z.string(),
      amount: z.number(),
    })
    .array(),

  candidacyFinancingMethodOtherSourceChecked: z.boolean(),
  candidacyFinancingMethodOtherSourceText: z.string().optional(),
});

type TrainingFormData = z.infer<typeof trainingFormSchema>;
type NullablePartial<T> = { [P in keyof T]?: T[P] | null };

export interface TrainingFormValues {
  individualHourCount: number;
  collectiveHourCount: number;
  additionalHourCount: number;
  mandatoryTrainingIds: string[];
  basicSkillIds: string[];
  certificateSkills: string;
  otherTraining: string;
  certificationScope: "PARTIAL" | "COMPLETE";
  candidacyFinancingMethods: { id: string; amount: number }[];
  candidacyFinancingMethodOtherSourceText?: string;
  candidacyFinancingMethodOtherSourceChecked?: boolean;
}
export interface TrainingFormProps {
  defaultValues: NullablePartial<TrainingFormValues>;
  basicSkillsFromReferential: { id: string; label: string }[];
  trainingsFromReferential: { id: string; label: string }[];
  candidacyFinancingMethodsFromReferential: { id: string; label: string }[];
  onSubmit?(values: TrainingFormValues): void;
  disabled?: boolean;
  showCertificationCompletionFields?: boolean;
  showCandidacyFinancingMethodFields?: boolean;
}

export const TrainingForm = ({
  defaultValues,
  basicSkillsFromReferential,
  trainingsFromReferential,
  candidacyFinancingMethodsFromReferential,
  onSubmit,
  disabled,
  showCertificationCompletionFields,
  showCandidacyFinancingMethodFields,
}: TrainingFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      individualHourCount: defaultValues.individualHourCount || 0,
      collectiveHourCount: defaultValues.collectiveHourCount || 0,
      additionalHourCount: defaultValues.additionalHourCount || 0,
      certificateSkills: defaultValues.certificateSkills || "",
      otherTraining: defaultValues.otherTraining || "",
      certificationScope: defaultValues.certificationScope || "COMPLETE",
      basicSkills: basicSkillsFromReferential?.map((s) => ({
        id: s.id,
        label: s.label,
        checked: defaultValues?.basicSkillIds?.includes(s.id),
      })),
      mandatoryTrainings: trainingsFromReferential?.map((t) => ({
        id: t.id,
        label: t.label,
        checked: defaultValues?.mandatoryTrainingIds?.includes(t.id),
      })),
      candidacyFinancingMethods: candidacyFinancingMethodsFromReferential?.map(
        (fm) => ({
          id: fm.id,
          originalId: fm.id,
          label: fm.label,
          amount:
            defaultValues?.candidacyFinancingMethods?.find(
              (cfm) => cfm.id === fm.id,
            )?.amount || 0,
        }),
      ),
      candidacyFinancingMethodOtherSourceChecked:
        !!defaultValues?.candidacyFinancingMethods?.find(
          (fm) => fm.id === OTHER_FINANCING_METHOD_ID,
        )?.amount || false,
      candidacyFinancingMethodOtherSourceText:
        defaultValues?.candidacyFinancingMethodOtherSourceText || "",
    },
  });

  const { fields: basicSkillsFields } = useFieldArray({
    control,
    name: "basicSkills",
  });

  const { fields: mandatoryTrainingsFields } = useFieldArray({
    control,
    name: "mandatoryTrainings",
  });

  const { fields: candidacyFinancingMethodsFields } = useFieldArray({
    control,
    name: "candidacyFinancingMethods",
  });

  const {
    candidacyFinancingMethodOtherSourceChecked,
    candidacyFinancingMethods,
  } = useWatch({ control });

  const handleFormSubmit = handleSubmit(
    (data) => {
      const {
        basicSkills,
        mandatoryTrainings,
        candidacyFinancingMethods,
        candidacyFinancingMethodOtherSourceText,
        ...rest
      } = data;

      if (showCandidacyFinancingMethodFields) {
        if (!candidacyFinancingMethods.some((fm) => fm.amount)) {
          setError("candidacyFinancingMethods", {
            type: "required",
            message: "Merci de remplir ce champ",
          });
          return;
        }

        if (
          candidacyFinancingMethods
            .filter((fm) => fm.amount)
            .some((fm) => fm.id === OTHER_FINANCING_METHOD_ID) &&
          !candidacyFinancingMethodOtherSourceText
        ) {
          setError("candidacyFinancingMethodOtherSourceText", {
            type: "required",
            message: "Merci de remplir ce champ",
          });
          return;
        }
      }

      onSubmit?.({
        ...rest,
        candidacyFinancingMethodOtherSourceText,
        mandatoryTrainingIds: mandatoryTrainings
          .filter((t) => t.checked)
          .map((t) => t.id),
        basicSkillIds: basicSkills.filter((s) => s.checked).map((s) => s.id),
        candidacyFinancingMethods: candidacyFinancingMethods
          .filter((fm) => fm.amount)
          .map((fm) => ({ id: fm.id, amount: fm.amount })),
      });
    },
    (e) => console.log({ error: e }),
  );

  return (
    <form className="flex flex-col" onSubmit={handleFormSubmit}>
      <h2 className="text-lg">Nombre d'heures</h2>
      <div className="grid md:grid-cols-3 gap-x-6">
        <Input
          disabled={disabled}
          label={
            <p className="text-xs mb-0 font-bold">
              NOMBRE D'HEURES D'ACCOMPAGNEMENT INDIVIDUEL
            </p>
          }
          hintText="Un entier supérieur ou égal à 0"
          nativeInputProps={{
            type: "number",
            ...register("individualHourCount", { valueAsNumber: true }),
          }}
          state={errors.individualHourCount ? "error" : "default"}
          stateRelatedMessage={errors.individualHourCount?.message}
        />
        <Input
          disabled={disabled}
          label={
            <p className="text-xs mb-0 font-bold">
              NOMBRE D'HEURES D'ACCOMPAGNEMENT COLLECTIF
            </p>
          }
          hintText="Un entier supérieur ou égal à 0"
          nativeInputProps={{
            type: "number",
            ...register("collectiveHourCount", { valueAsNumber: true }),
          }}
          state={errors.collectiveHourCount ? "error" : "default"}
          stateRelatedMessage={errors.collectiveHourCount?.message}
        />
        <Input
          disabled={disabled}
          label={
            <p className="text-xs mb-0 font-bold">
              NOMBRE D’HEURES DE FORMATIONS COMPLÉMENTAIRES
            </p>
          }
          hintText="Un entier supérieur ou égal à 0"
          nativeInputProps={{
            type: "number",
            ...register("additionalHourCount", { valueAsNumber: true }),
          }}
          state={errors.additionalHourCount ? "error" : "default"}
          stateRelatedMessage={errors.additionalHourCount?.message}
        />
      </div>
      <hr />
      <h2 className="text-lg">Compléments formatifs</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Checkbox
          disabled={disabled}
          legend="Formations obligatoires"
          options={mandatoryTrainingsFields.map((t, tIndex) => ({
            label: t.label,
            nativeInputProps: {
              ...register(`mandatoryTrainings.${tIndex}.checked`),
            },
          }))}
        />
        <Checkbox
          disabled={disabled}
          className="items-start"
          legend="Savoirs de base"
          options={basicSkillsFields.map((s, sIndex) => ({
            label: s.label,
            nativeInputProps: {
              ...register(`basicSkills.${sIndex}.checked`),
            },
          }))}
        />
      </div>
      <br />
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          disabled={disabled}
          textArea
          label={
            <p className="text-xs mb-0 font-bold">
              BLOCS DE COMPÉTENCES MÉTIER (OPTIONNEL)
            </p>
          }
          hintText="Texte de description libre"
          nativeTextAreaProps={{
            rows: 6,
            placeholder: "RNCP25467BC03 - intitulé",
            ...register("certificateSkills"),
          }}
          state={errors.certificateSkills ? "error" : "default"}
          stateRelatedMessage={errors.certificateSkills?.message}
        />

        <Input
          disabled={disabled}
          textArea
          label={
            <p className="text-xs mb-0 font-bold">
              AUTRES ACTIONS DE FORMATION (OPTIONNEL)
            </p>
          }
          hintText="Texte de description libre"
          nativeTextAreaProps={{
            rows: 6,
            ...register("otherTraining"),
          }}
          state={errors.otherTraining ? "error" : "default"}
          stateRelatedMessage={errors.otherTraining?.message}
        />
      </div>
      <br />
      {showCertificationCompletionFields && (
        <RadioButtons
          legend="Le candidat / la candidate vise :"
          disabled={disabled}
          options={[
            {
              label: "La certification dans sa totalité",
              nativeInputProps: {
                ...register("certificationScope"),
                value: "COMPLETE",
              },
            },
            {
              label: "Un ou plusieurs bloc(s) de compétences",
              nativeInputProps: {
                ...register("certificationScope"),
                value: "PARTIAL",
              },
            },
          ]}
          state={errors.certificationScope ? "error" : "default"}
          stateRelatedMessage={errors.certificationScope?.message}
        />
      )}
      <br />
      {showCandidacyFinancingMethodFields && (
        <>
          <h2 className="text-lg">Modalités de financement</h2>
          <p>
            Ces éléments sont demandés à titre indicatifs, en l'absence
            d'information un montant approximatif peut être renseigné.
          </p>
          <div className="grid md:grid-cols-[1fr_180px] gap-x-20 mb-12">
            {candidacyFinancingMethodsFields
              .filter((fm) => fm.originalId !== OTHER_FINANCING_METHOD_ID)
              .map((fm, fmIndex) => (
                <Fragment key={fm.id}>
                  <span className="text-dsfrGray-labelGrey">{fm.label}</span>
                  <Input
                    label=""
                    iconId="fr-icon-money-euro-circle-line"
                    key={fm.id}
                    nativeInputProps={{
                      type: "number",
                      step: "0.01",
                      min: 0,
                      inputMode: "decimal",
                      ...register(
                        `candidacyFinancingMethods.${fmIndex}.amount`,
                        { valueAsNumber: true },
                      ),
                    }}
                    state={
                      errors.candidacyFinancingMethods ? "error" : "default"
                    }
                    stateRelatedMessage={
                      errors.candidacyFinancingMethods?.message
                    }
                  />
                </Fragment>
              ))}
            <Checkbox
              className="col-span-2"
              small
              options={[
                {
                  label: "Autre source de financement",
                  nativeInputProps: {
                    ...register("candidacyFinancingMethodOtherSourceChecked"),
                  },
                },
              ]}
            />
            {candidacyFinancingMethodOtherSourceChecked && (
              <>
                <Input
                  disabled={disabled}
                  label="S’il s’agit d’une autre source de financement, merci de l’indiquer ici :"
                  nativeInputProps={{
                    ...register("candidacyFinancingMethodOtherSourceText"),
                  }}
                  state={
                    errors.candidacyFinancingMethodOtherSourceText
                      ? "error"
                      : "default"
                  }
                  stateRelatedMessage={
                    errors.candidacyFinancingMethodOtherSourceText?.message
                  }
                />
                <Input
                  label=""
                  className="mt-8"
                  iconId="fr-icon-money-euro-circle-line"
                  nativeInputProps={{
                    type: "number",
                    step: "0.01",
                    min: 0,
                    inputMode: "decimal",
                    ...register(
                      `candidacyFinancingMethods.${candidacyFinancingMethodsFields.findIndex((fm) => fm.originalId === OTHER_FINANCING_METHOD_ID)}.amount`,
                      { valueAsNumber: true },
                    ),
                  }}
                  state={errors.candidacyFinancingMethods ? "error" : "default"}
                  stateRelatedMessage={
                    errors.candidacyFinancingMethods?.message
                  }
                />
              </>
            )}
            <div>Total</div>
            <div className="font-medium ml-auto">
              {candidacyFinancingMethods
                ?.reduce((acc, fm) => acc + (fm?.amount || 0), 0)
                .toFixed(2)}{" "}
              €
            </div>
          </div>
        </>
      )}
      <Button className="ml-auto" disabled={isSubmitting || disabled}>
        Envoyer le parcours
      </Button>
    </form>
  );
};
