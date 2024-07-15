import DffSummary from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/_components/DffSummary/DffSummary";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { DematerializedFeasibilityFile } from "@/graphql/generated/graphql";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AAPSection } from "./AAPSection";
import { useDematerializedFeasibility } from "./dematerializedFeasibility.hook";

const schema = z
  .object({
    swornStatement: z.object({
      0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
    }),
  })
  .superRefine(({ swornStatement }, { addIssue }) => {
    if (!swornStatement?.[0]) {
      addIssue({
        path: ["idCard"],
        message: "Merci de remplir ce champ",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type FormData = z.infer<typeof schema>;

export const DematerializedFeasibility = () => {
  const { dematerializedFeasibilityFile } = useDematerializedFeasibility();

  const resetFiles = useCallback(() => {}, []);

  useEffect(() => {
    resetFiles();
  }, [resetFiles]);

  const defaultValues = useMemo(
    () => ({
      swornStatement: undefined,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <div>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
      />

      <AAPSection />
      <form>
        <FormButtons
          backUrl={"/candidacies/feasibilities"}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
};
