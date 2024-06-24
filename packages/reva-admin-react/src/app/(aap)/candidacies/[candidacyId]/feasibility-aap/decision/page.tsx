"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { DfFileDecision } from "@/graphql/generated/graphql";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDecisionCard } from "../_components/decisionCard.hook";
import { useDecision } from "./_components/decision.hook";

const schema = z
  .object({
    decision: z.enum(["ACCEPTED", "REJECTED"], {
      invalid_type_error: "Veuillez sélectionner un avis",
    }),
    decisionComment: z.string().min(1, {
      message: "Veuillez saisir un commentaire",
    }),
  })
  .superRefine(({ decision }, ctx) => {
    if (!decision) {
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
  const { decision, decisionComment } = useDecisionCard();
  const { createOrUpdateDecisionMutation } = useDecision();
  const defaultValues = useMemo(
    () => ({
      decision: decision as DecisionForm["decision"],
      decisionComment: decisionComment ?? "",
    }),
    [decision, decisionComment],
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

  const handleFormSubmit = async (data: DecisionForm) => {
    try {
      await createOrUpdateDecisionMutation({
        candidacyId,
        aapDecision: data.decision as DfFileDecision,
        aapDecisionComment: data.decisionComment,
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
            state={errors.decision ? "error" : "default"}
            stateRelatedMessage={errors.decision?.message}
            options={[
              {
                label: "Favorable",
                nativeInputProps: {
                  value: "ACCEPTED",
                  ...register("decision"),
                },
              },
              {
                label: "Non favorable",
                nativeInputProps: {
                  value: "REJECTED",
                  ...register("decision"),
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
            nativeTextAreaProps={register("decisionComment")}
            state={errors.decisionComment ? "error" : "default"}
            stateRelatedMessage={errors.decisionComment?.message}
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
