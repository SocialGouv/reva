import Button from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { OTHER_FINANCING_METHOD_ID } from "../trainingPage.hook";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

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
  estimatedCost: z
    .number({ errorMap: () => ({ message: "Merci de remplir ce champ" }) })
    .max(1000000, "La valeur de ce champ est trop élevée")
    .optional(),
  candidacyFinancingMethods: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),

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
  candidacyFinancingMethodIds: string[];
  candidacyFinancingMethodOtherSourceText?: string;
  estimatedCost?: number;
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
          label: fm.label,
          checked: defaultValues?.candidacyFinancingMethodIds?.includes(fm.id),
        }),
      ),
      candidacyFinancingMethodOtherSourceText:
        defaultValues?.candidacyFinancingMethodOtherSourceText || "",
      estimatedCost: defaultValues?.estimatedCost || undefined,
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

  const { candidacyFinancingMethods } = useWatch({ control });

  const handleFormSubmit = handleSubmit(
    (data) => {
      const {
        basicSkills,
        mandatoryTrainings,
        candidacyFinancingMethods,
        candidacyFinancingMethodOtherSourceText,
        estimatedCost,
        ...rest
      } = data;

      if (showCandidacyFinancingMethodFields) {
        if (!estimatedCost) {
          setError("estimatedCost", {
            type: "required",
            message: "Merci de remplir ce champ",
          });
          return;
        }

        if (!candidacyFinancingMethods.some((fm) => fm.checked)) {
          setError("candidacyFinancingMethods", {
            type: "required",
            message: "Merci de remplir ce champ",
          });
          return;
        }

        if (
          candidacyFinancingMethods
            .filter((fm) => fm.checked)
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
        estimatedCost,
        candidacyFinancingMethodOtherSourceText,
        mandatoryTrainingIds: mandatoryTrainings
          .filter((t) => t.checked)
          .map((t) => t.id),
        basicSkillIds: basicSkills.filter((s) => s.checked).map((s) => s.id),
        candidacyFinancingMethodIds: candidacyFinancingMethods
          .filter((fm) => fm.checked)
          .map((fm) => fm.id),
      });
    },
    (e) => console.log({ error: e }),
  );

  const candidacyFinancingMethodOtherSourceTextInputDisabled =
    !candidacyFinancingMethods?.find(
      (fm) => fm.id === OTHER_FINANCING_METHOD_ID,
    )?.checked;

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
          <Input
            className="lg:max-w-xl"
            disabled={disabled}
            label="Montant du devis validé par le candidat :"
            nativeInputProps={{
              ...register("estimatedCost", { valueAsNumber: true }),
              type: "number",
              step: "0.01",
              min: 0,
              inputMode: "decimal",
            }}
            state={errors.estimatedCost ? "error" : "default"}
            stateRelatedMessage={errors.estimatedCost?.message}
          />

          <SmallNotice className="mb-6 lg:max-w-xl">
            <span>
              Dans le cadre d’un financement via Mon Compte Formation, le devis
              doit être validé avant l’étude de faisabilité pour qu’elle puisse
              être prise en charge. Si le financement mobilisé par le candidat
              doit être sollicité après la notification de recevabilité, vous
              pouvez renseigner un montant prévisionnel.
            </span>
          </SmallNotice>

          <Checkbox
            disabled={disabled}
            legend="Plusieurs financements possibles :"
            options={candidacyFinancingMethodsFields.map((fm, fmIndex) => ({
              label: fm.label,
              nativeInputProps: {
                ...register(`candidacyFinancingMethods.${fmIndex}.checked`),
              },
            }))}
            state={errors.candidacyFinancingMethods ? "error" : "default"}
            stateRelatedMessage={errors.candidacyFinancingMethods?.message}
          />
          <Input
            disabled={
              disabled || candidacyFinancingMethodOtherSourceTextInputDisabled
            }
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
        </>
      )}
      <Button className="ml-auto" disabled={isSubmitting || disabled}>
        Envoyer le parcours
      </Button>
    </form>
  );
};
