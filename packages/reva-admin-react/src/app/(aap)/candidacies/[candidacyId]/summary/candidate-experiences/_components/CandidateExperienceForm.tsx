import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useParams } from "next/navigation";

const durationValues = [
  "unknown",
  "lessThanOneYear",
  "betweenOneAndThreeYears",
  "moreThanThreeYears",
  "moreThanFiveYears",
  "moreThanTenYears",
] as const;

type Duration = (typeof durationValues)[number];

const durationToString: {
  [key in Duration]: string;
} = {
  unknown: "Inconnue",
  lessThanOneYear: "Moins d'un an",
  betweenOneAndThreeYears: "Entre 1 et 3 ans",
  moreThanThreeYears: "Plus de 3 ans",
  moreThanFiveYears: "Plus de 5 ans",
  moreThanTenYears: "Plus de 10 ans",
};

export const schema = z.object({
  title: z.string().min(1, "Ce champ est obligatoire"),
  description: z.string(),
  startedAt: z.string().min(1, "Ce champ est obligatoire"),
  duration: z.enum(durationValues),
});

export type CandidateExperienceFormData = z.infer<typeof schema>;

export const CandidateExperienceForm = ({
  onSubmit,
  editedExperience,
}: {
  onSubmit(data: CandidateExperienceFormData): Promise<void>;
  editedExperience?: CandidateExperienceFormData;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const methods = useForm<CandidateExperienceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...editedExperience,
      duration: editedExperience?.duration || "unknown",
    },
  });

  const {
    register,
    formState,
    formState: { isSubmitting, errors, isDirty },
    handleSubmit,
    reset,
  } = methods;

  const resetForm = useCallback(() => {
    if (editedExperience) {
      reset(editedExperience);
    } else {
      reset({
        title: "",
        description: "",
        startedAt: undefined,
        duration: "unknown",
      });
    }
  }, [editedExperience, reset]);

  useEffect(() => {
    if (!isDirty) {
      resetForm();
    }
  }, [isDirty, resetForm]);

  const handleFormSubmit = handleSubmit(onSubmit);
  return (
    <div className="flex flex-col">
      <h1>Expérience du candidat</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Il peut s’agir d’une expérience professionnelle, bénévole, d’un stage ou
        d’une activité extra-professionnelle.
      </p>
      <form
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
          <Input
            className="col-span-2"
            label="Intitulé de l’expérience"
            hintText="Exemple : Agent d’entretien ; Service à domicile ; Commercial ; etc."
            nativeInputProps={{ ...register("title") }}
            state={errors.title ? "error" : "default"}
            stateRelatedMessage={errors.title?.message}
          />
          <Input
            label="Date de début"
            nativeInputProps={{ type: "date", ...register("startedAt") }}
            state={errors.startedAt ? "error" : "default"}
            stateRelatedMessage={errors.startedAt?.message}
          />
          <Select
            label="Durée"
            nativeSelectProps={{
              ...register("duration"),
            }}
            state={errors.duration ? "error" : "default"}
            stateRelatedMessage={errors.duration?.message}
          >
            {durationValues.map((d) => (
              <option key={d} value={d}>
                {durationToString[d]}
              </option>
            ))}
          </Select>
          <Input
            className="col-span-2"
            classes={{ nativeInputOrTextArea: "min-h-[100px]" }}
            textArea
            label="Description de l’expérience"
            hintText="Exemple : Entretien de l’espace de vie ; respect des normes d’hygiène ; pilotage d’activité commerciale ; etc."
            nativeTextAreaProps={{ ...register("description") }}
            state={errors.description ? "error" : "default"}
            stateRelatedMessage={errors.description?.message}
          />
        </div>
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/summary`}
          formState={formState}
        />
      </form>
    </div>
  );
};
