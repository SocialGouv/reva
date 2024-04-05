"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { GenderEnum } from "@/constants";
import { Candidacy } from "@/graphql/generated/graphql";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ChoixCandidatBlock } from "./_components/ChoixCandidatBlock";
import { InformationCandidatBlock } from "./_components/InformationCandidatBlock";
import { ParcoursPersonnaliseBlock } from "./_components/ParcoursPersonnaliseBlock";
import { ResponsableFinancementBlock } from "./_components/ResponsableFinancementBlock";
import { useCandidacyFunding } from "./_components/useCandidacyFunding.hook";

import { z } from "zod";

const candidacyFundingSchema = z.object({
  candidateSecondname: z.string().optional(),
  candidateThirdname: z.string().optional(),
  candidateGender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
  individualHourCount: z.number(),
  individualCost: z.number(),
  collectiveHourCount: z.number(),
  collectiveCost: z.number(),
  basicSkillsHourCount: z.number(),
  basicSkillsCost: z.number(),
  mandatoryTrainingsHourCount: z.number(),
  mandatoryTrainingsCost: z.number(),
  certificateSkillsHourCount: z.number(),
  certificateSkillsCost: z.number(),
  otherTrainingHourCount: z.number(),
  otherTrainingCost: z.number(),
  fundingContactFirstname: z.string().optional(),
  fundingContactLastname: z.string().optional(),
  fundingContactEmail: z.string().optional(),
  fundingContactPhone: z.string().optional(),
});

type CandidacyFundingFormData = z.infer<typeof candidacyFundingSchema>;

const CustomSeparator = () => <hr className="flex mb-2 mt-8" />;

const FundingPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const [formConfirmation, setFormConfirmation] = useState(false);

  const {
    candidacy,
    createFundingRequestUnifvaeMutate,
    candidacyHasAlreadyFundingRequest,
    candidacyIsXpReva,
    candidacyHasDroppedOutAndIsIncomplete,
    candidacyIsNotRecevable,
    candidacyFundingRequest,
  } = useCandidacyFunding(candidacyId);

  const isReadOnly = candidacyIsXpReva || candidacyHasAlreadyFundingRequest;
  const isForfaitOnly =
    candidacyHasDroppedOutAndIsIncomplete || candidacyIsNotRecevable;

  const methods = useForm<CandidacyFundingFormData>({
    resolver: zodResolver(candidacyFundingSchema),
    defaultValues: {
      candidateSecondname: candidacy?.candidate?.firstname2 || "",
      candidateThirdname: candidacy?.candidate?.firstname3 || "",
      candidateGender:
        (candidacy?.candidate?.gender as GenderEnum) || GenderEnum.undisclosed,
      individualHourCount: candidacyFundingRequest?.individualHourCount ?? 0,
      individualCost: candidacyFundingRequest?.individualCost ?? 0,
      collectiveHourCount: candidacyFundingRequest?.collectiveHourCount ?? 0,
      collectiveCost: candidacyFundingRequest?.collectiveCost ?? 0,
      basicSkillsHourCount: candidacyFundingRequest?.basicSkillsHourCount ?? 0,
      basicSkillsCost: candidacyFundingRequest?.basicSkillsCost ?? 0,
      mandatoryTrainingsHourCount:
        candidacyFundingRequest?.mandatoryTrainingsHourCount ?? 0,
      mandatoryTrainingsCost:
        candidacyFundingRequest?.mandatoryTrainingsCost ?? 0,
      certificateSkillsHourCount:
        candidacyFundingRequest?.certificateSkillsHourCount ?? 0,
      certificateSkillsCost:
        candidacyFundingRequest?.certificateSkillsCost ?? 0,
      otherTrainingHourCount:
        candidacyFundingRequest?.otherTrainingHourCount ?? 0,
      otherTrainingCost: candidacyFundingRequest?.otherTrainingCost ?? 0,
      fundingContactFirstname:
        candidacy?.fundingRequestUnifvae?.fundingContactFirstname ?? "",
      fundingContactLastname:
        candidacy?.fundingRequestUnifvae?.fundingContactLastname ?? "",
      fundingContactEmail:
        candidacy?.fundingRequestUnifvae?.fundingContactEmail ?? "",
      fundingContactPhone:
        candidacy?.fundingRequestUnifvae?.fundingContactPhone ?? "",
    },
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isDirty, isSubmitting },
  } = methods;

  const onSubmit = async (data: CandidacyFundingFormData) => {
    try {
      await createFundingRequestUnifvaeMutate(data);
      successToast("La demande de financement a bien été enregistrée.");
    } catch (e: any) {
      if (e.response?.errors) {
        e.response.errors.forEach((error: any) => {
          const isInputError = error.message.startsWith("input.");
          if (isInputError) {
            const errorField = error.message.split(".")[1].split(":")[0];
            const errorMessage = error.message.split(":")[1].trim();
            if (errorField && errorMessage) {
              setError(errorField as keyof CandidacyFundingFormData, {
                message: errorMessage,
              });
            }
          }
        });
      } else {
        graphqlErrorToast(e);
      }
    }
  };

  const resetForm = useCallback(() => {
    reset({
      candidateSecondname: candidacy?.candidate?.firstname2 || "",
      candidateThirdname: candidacy?.candidate?.firstname3 || "",
      candidateGender:
        (candidacy?.candidate?.gender as GenderEnum) || GenderEnum.undisclosed,
      individualHourCount: candidacyFundingRequest?.individualHourCount || 0,
      individualCost: candidacyFundingRequest?.individualCost || 0,
      collectiveHourCount: candidacyFundingRequest?.collectiveHourCount ?? 0,
      collectiveCost: candidacyFundingRequest?.collectiveCost ?? 0,
      basicSkillsHourCount: candidacyFundingRequest?.basicSkillsHourCount ?? 0,
      basicSkillsCost: candidacyFundingRequest?.basicSkillsCost ?? 0,
      mandatoryTrainingsHourCount:
        candidacyFundingRequest?.mandatoryTrainingsHourCount ?? 0,
      mandatoryTrainingsCost:
        candidacyFundingRequest?.mandatoryTrainingsCost ?? 0,
      certificateSkillsHourCount:
        candidacyFundingRequest?.certificateSkillsHourCount ?? 0,
      certificateSkillsCost:
        candidacyFundingRequest?.certificateSkillsCost ?? 0,
      otherTrainingHourCount:
        candidacyFundingRequest?.otherTrainingHourCount ?? 0,
      otherTrainingCost: candidacyFundingRequest?.otherTrainingCost ?? 0,
      fundingContactFirstname:
        candidacy?.fundingRequestUnifvae?.fundingContactFirstname ?? "",
      fundingContactLastname:
        candidacy?.fundingRequestUnifvae?.fundingContactLastname ?? "",
      fundingContactEmail:
        candidacy?.fundingRequestUnifvae?.fundingContactEmail ?? "",
      fundingContactPhone:
        candidacy?.fundingRequestUnifvae?.fundingContactPhone ?? "",
    });
  }, [reset, candidacyFundingRequest, candidacy]);

  useEffect(() => {
    if (candidacy) {
      resetForm();
    }
  }, [candidacy, resetForm]);

  return (
    <div className="flex flex-col w-full p-2">
      <div>
        <h1>Demande de prise en charge</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <FormProvider {...methods}>
        <form
          className="flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
        >
          <InformationCandidatBlock
            candidacy={candidacy as Candidacy}
            isReadOnly={isReadOnly}
          />
          <CustomSeparator />
          <ChoixCandidatBlock candidacy={candidacy as Candidacy} />
          <CustomSeparator />
          <ParcoursPersonnaliseBlock
            candidacy={candidacy as Candidacy}
            isReadOnly={isReadOnly}
            isForfaitOnly={isForfaitOnly}
          />
          <CustomSeparator />
          <ResponsableFinancementBlock isReadOnly={isReadOnly} />
          <GrayCard className="pb-2">
            <h2 className="text-xl">Avant de finaliser votre envoi :</h2>
            <Checkbox
              options={[
                {
                  label:
                    "Je confirme le montant de la prise en charge. Je ne pourrai pas modifier cette demande après son envoi.",
                  nativeInputProps: {
                    checked: formConfirmation,
                    onChange: (e) => setFormConfirmation(e.target.checked),
                  },
                },
              ]}
            />
          </GrayCard>

          <FormButtons
            backUrl={`/candidacies/${candidacyId}/summary`}
            formState={{
              isDirty: (isDirty || formConfirmation) && !isReadOnly,
              isSubmitting,
            }}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default FundingPage;
