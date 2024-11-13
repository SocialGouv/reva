import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export const competenceBlocFormSchema = z.object({
  label: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  competences: z
    .object({
      id: z.string().optional(),
      label: z
        .string()
        .min(2, "Ce champ doit contenir au moins 2 caractères")
        .default(""),
      index: z.number(),
    })
    .array(),
});

export type CompetenceBlocFormData = z.infer<typeof competenceBlocFormSchema>;

export const CompetenceBlocForm = ({
  onSubmit,
  defaultValues,
  backUrl,
  className = "",
}: {
  onSubmit(data: CompetenceBlocFormData): Promise<void>;
  defaultValues: Partial<CompetenceBlocFormData>;
  backUrl: string;
  className?: string;
}) => {
  const methods = useForm<CompetenceBlocFormData>({
    resolver: zodResolver(competenceBlocFormSchema),
    defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = methods;

  const { fields: competencesFields } = useFieldArray({
    control,
    name: "competences",
  });

  const handleFormSubmit = handleSubmit(onSubmit, (e) => console.log(e));
  return (
    <form onSubmit={handleFormSubmit} className={`${className}`}>
      <Input
        data-test="competence-bloc-label-input"
        label="Intitulé du bloc de compétences"
        state={errors.label ? "error" : "default"}
        stateRelatedMessage={errors.label?.message?.toString()}
        nativeInputProps={{
          ...register("label"),
        }}
      />
      <div className="flex flex-col gap-2 mt-6 pl-4">
        {competencesFields.map((c, cIndex) => (
          <Input
            className="mb-0"
            label=""
            state={errors.competences?.[cIndex]?.label ? "error" : "default"}
            stateRelatedMessage={errors.competences?.[
              cIndex
            ]?.label?.message?.toString()}
            key={c.id}
            nativeInputProps={{ ...register(`competences.${cIndex}.label`) }}
          />
        ))}
      </div>
      <FormButtons
        backUrl={backUrl}
        formState={{
          isDirty,
          isSubmitting,
        }}
      />
    </form>
  );
};
