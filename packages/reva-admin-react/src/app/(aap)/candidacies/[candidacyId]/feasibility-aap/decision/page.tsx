"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDecision } from "./_components/decision.hook";

const schema = z
  .object({
    aapDecision: z.enum(["FAVORABLE", "UNFAVORABLE"], {
      invalid_type_error: "Veuillez sélectionner un avis",
    }),
    aapDecisionComment: z.string().min(1, {
      message: "Veuillez saisir un commentaire",
    }),
  })
  .superRefine(({ aapDecision }, ctx) => {
    if (!aapDecision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez sélectionner un avis",
        path: ["decision"],
      });
    }
  });

type DecisionForm = z.infer<typeof schema>;

export default function DecisionPage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const router = useRouter();
  const { createOrUpdateDecisionMutation, aapDecision, aapDecisionComment } =
    useDecision();
  const defaultValues = useMemo(
    () => ({
      aapDecision: aapDecision as DecisionForm["aapDecision"],
      aapDecisionComment: aapDecisionComment ?? "",
    }),
    [aapDecision, aapDecisionComment],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DecisionForm>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = async ({
    aapDecision,
    aapDecisionComment,
  }: DecisionForm) => {
    try {
      await createOrUpdateDecisionMutation({
        candidacyId,
        aapDecision,
        aapDecisionComment,
      });
      successToast("Avis enregistré");
      router.push(`/candidacies/${candidacyId}/feasibility-aap`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const resetForm = useCallback(
    () => reset(defaultValues),
    [reset, defaultValues],
  );

  useEffect(resetForm, [resetForm]);

  return (
    <div className="flex flex-col">
      <h1>Avis sur la faisabilité</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Donnez l'avis que vous souhaitez émettre quant à cette candidature.
        Expliquer ensuite les raisons pour lesquelles vous vous positionnez sur
        cet avis.
      </p>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <div>
          <h6>Avis sur ce dossier</h6>
          <RadioButtons
            className="mb-6"
            name="decision"
            state={errors.aapDecision ? "error" : "default"}
            stateRelatedMessage={errors.aapDecision?.message}
            options={[
              {
                label: "Favorable",
                nativeInputProps: {
                  value: "FAVORABLE",
                  ...register("aapDecision"),
                },
              },
              {
                label: "Non favorable",
                nativeInputProps: {
                  value: "UNFAVORABLE",
                  ...register("aapDecision"),
                },
              },
            ]}
          />
        </div>
        <div className="my-2">
          <p className="font-bold">
            Commentaires/préconisations (éléments d'argumentation, réorientation
            éventuelle…)
          </p>
          <Input
            textArea
            label=""
            hideLabel
            nativeTextAreaProps={register("aapDecisionComment")}
            state={errors.aapDecisionComment ? "error" : "default"}
            stateRelatedMessage={errors.aapDecisionComment?.message}
          />
        </div>
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
