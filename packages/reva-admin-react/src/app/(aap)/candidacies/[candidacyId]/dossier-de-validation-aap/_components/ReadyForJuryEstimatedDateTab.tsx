import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const readyForJuryEstimatedAtSchema = z.object({
  readyForJuryEstimatedAt: z.string(),
});

export type ReadyForJuryEstimatedAtSchemaFormData = z.infer<
  typeof readyForJuryEstimatedAtSchema
>;

export const ReadyForJuryEstimatedDateTab = ({
  readyForJuryEstimatedAt,
  onFormSubmit,
}: {
  readyForJuryEstimatedAt?: number;
  onFormSubmit: (data: ReadyForJuryEstimatedAtSchemaFormData) => Promise<void>;
}) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<ReadyForJuryEstimatedAtSchemaFormData>({
    resolver: zodResolver(readyForJuryEstimatedAtSchema),
    defaultValues: {
      readyForJuryEstimatedAt: format(
        new Date(readyForJuryEstimatedAt || ""),
        "yyyy-MM-dd",
      ),
    },
  });

  const handleReset = useCallback(() => {
    reset({
      readyForJuryEstimatedAt: format(
        new Date(readyForJuryEstimatedAt || ""),
        "yyyy-MM-dd",
      ),
    });
  }, [readyForJuryEstimatedAt, reset]);

  const handleFormSubmit = handleSubmit(onFormSubmit);

  return (
    <form
      className="flex flex-col overflow-auto"
      onSubmit={handleFormSubmit}
      onReset={(e) => {
        e.preventDefault();
        handleReset();
      }}
    >
      <p>
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <p>La date prévisionnelle correspond :</p>
      <ul className="mt-0">
        <li>
          à la date à laquelle le candidat aura finalisé son dossier de
          validation pour les certifications du Ministère du Travail et des
          Branches Professionnelles
        </li>
        <li>
          à la date de dépôt du dossier de validation pour les autres
          certifications
        </li>
      </ul>
      <br />
      <Input
        className="max-w-xs"
        label="Date prévisonnelle"
        hintText="Date au format 31/12/2022"
        nativeInputProps={{
          type: "date",
          ...register("readyForJuryEstimatedAt"),
        }}
      />
      <FormButtons formState={{ isDirty, isSubmitting }} />
    </form>
  );
};
