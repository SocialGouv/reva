import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCallback, useEffect } from "react";
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
      readyForJuryEstimatedAt: readyForJuryEstimatedAt
        ? format(new Date(readyForJuryEstimatedAt || 0), "yyyy-MM-dd")
        : undefined,
    },
  });

  const handleReset = useCallback(() => {
    reset({
      readyForJuryEstimatedAt: readyForJuryEstimatedAt
        ? format(new Date(readyForJuryEstimatedAt || 0), "yyyy-MM-dd")
        : undefined,
    });
  }, [readyForJuryEstimatedAt, reset]);

  const handleFormSubmit = handleSubmit(onFormSubmit);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <form
      onSubmit={handleFormSubmit}
      onReset={(e) => {
        e.preventDefault();
        handleReset();
      }}
    >
      <div className="flex flex-col overflow-auto gap-10">
        <p className="m-0">
          La date prévisionnelle est une estimation et sert principalement à
          anticiper le passage devant le jury. Elle n’est pas engageante pour le
          candidat.
        </p>

        <Input
          className="max-w-xs"
          label="Date prévisonnelle"
          hintText="Date au format 31/12/2022"
          nativeInputProps={{
            type: "date",
            ...register("readyForJuryEstimatedAt"),
          }}
        />
      </div>

      <FormButtons formState={{ isDirty, isSubmitting }} />
    </form>
  );
};
