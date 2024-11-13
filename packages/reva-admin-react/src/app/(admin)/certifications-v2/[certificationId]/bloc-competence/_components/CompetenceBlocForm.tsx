import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export const competenceBlocFormSchema = z.object({
  label: z.string().min(1, "Merci de remplir ce champ").default(""),
  competences: z
    .object({
      id: z.string().optional(),
      label: z.string().min(1, "Merci de remplir ce champ").default(""),
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

  const {
    fields: competencesFields,
    append: appendCompetence,
    remove: removeCompetence,
  } = useFieldArray({
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
      <div
        className="flex flex-col gap-2 mt-6 mb-2 pl-4"
        data-test="competence-list"
      >
        {competencesFields.map((c, cIndex) => (
          <div className="flex content-betwee gap-2" key={c.id}>
            <Input
              className="mb-0 w-full"
              label=""
              state={errors.competences?.[cIndex]?.label ? "error" : "default"}
              stateRelatedMessage={errors.competences?.[
                cIndex
              ]?.label?.message?.toString()}
              nativeInputProps={{ ...register(`competences.${cIndex}.label`) }}
            />
            <Button
              data-test="remove-competence-button"
              type="button"
              priority="tertiary no outline"
              iconId="fr-icon-delete-line"
              iconPosition="left"
              onClick={() => removeCompetence(cIndex)}
            >
              Supprimer
            </Button>
          </div>
        ))}
      </div>
      <Button
        data-test="add-competence-button"
        type="button"
        priority="tertiary no outline"
        iconId="fr-icon-add-line"
        iconPosition="left"
        onClick={() =>
          appendCompetence({ label: "", index: competencesFields.length })
        }
      >
        Ajouter une compétence
      </Button>
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
