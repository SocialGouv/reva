import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import { z } from "zod";

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
}: {
  onSubmit(data: CandidateExperienceFormData): Promise<void>;
}) => {
  const methods = useForm<CandidateExperienceFormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration: "unknown" },
  });
  const {
    control,
    register,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = methods;

  const durationController = useController({
    name: "duration",
    control,
  });

  const handleFormSubmit = handleSubmit(onSubmit);
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6"
      onSubmit={handleFormSubmit}
    >
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
          onChange: durationController.field.onChange,
          value: durationController.field.value,
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
      <div className="col-span-2 flex flex-col md:flex-row gap-4 items-center justify-center md:justify-end mt-10">
        <Button priority="secondary" type="reset">
          Annuler
        </Button>
        <Button disabled={isSubmitting}>Valider</Button>
      </div>
    </form>
  );
};
