"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { useCallback, useEffect } from "react";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { z } from "zod";
import { usePaymentRequestUniRevaConfirmationPage } from "./paymentRequestUniRevaConfirmation.hook";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Info } from "../../_components/form/Info";
import { costsAndHoursTotal } from "../paymentRequestUniRevaPaymentUtils";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const paymentRequestUniRevaConfirmationSchema = z.object({
  payementRequestConfirmation: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher la case",
    }),
  }),
});

export type PaymentRequestUniRevaConfirmationFormData = z.infer<
  typeof paymentRequestUniRevaConfirmationSchema
>;

const PaymentRequestUniRevaConfirmationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { candidacy, confirmPaymentRequestUniReva, getCandidacyStatus } =
    usePaymentRequestUniRevaConfirmationPage();

  const {
    register,
    reset,
    formState,
    formState: { errors },
    handleSubmit,
  } = useForm<PaymentRequestUniRevaConfirmationFormData>({
    resolver: zodResolver(paymentRequestUniRevaConfirmationSchema),
  });

  const handleFormSubmit = handleSubmit(
    async () => {
      try {
        await confirmPaymentRequestUniReva.mutateAsync();
        queryClient.invalidateQueries({ queryKey: [candidacyId] });
        successToast("Modifications enregistrées");
        router.push(`/candidacies/${candidacyId}/summary`);
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    (e) => console.log({ e }),
  );

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const activeCandidacyStatus = candidacy?.status;

  const paymentRequestAlreadySent =
    activeCandidacyStatus &&
    isCandidacyStatusEqualOrAbove(
      activeCandidacyStatus,
      "DEMANDE_PAIEMENT_ENVOYEE",
    );

  const { totalCost } = costsAndHoursTotal(candidacy?.paymentRequest || {});

  return (
    <div className="flex flex-col w-full p-1 md:p-2">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1>Demande de paiement</h1>
      <FormOptionalFieldsDisclaimer />
      <Stepper title="Confirmation" currentStep={3} stepCount={3} />
      <hr />
      {getCandidacyStatus === "success" && (
        <>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Info title="NUMÉRO DE PRISE EN CHARGE FRANCE VAE">
              {candidacy?.fundingRequest?.numAction}
            </Info>
            <Info title="NUMÉRO DE FACTURE">
              {candidacy?.paymentRequest?.invoiceNumber}
            </Info>
            <Info title="COÛT TOTAL DE LA DEMANDE DE PAIEMENT">
              {totalCost} €
            </Info>
          </dl>
          <form
            className="flex flex-col gap-6 mt-6"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <Checkbox
              options={[
                {
                  label:
                    "Je confirme ce montant de paiement. Je ne pourrai pas modifier cette demande de paiement après son envoi.",
                  nativeInputProps: {
                    ...register("payementRequestConfirmation"),
                  },
                },
              ]}
              state={
                formState.errors.payementRequestConfirmation
                  ? "error"
                  : "default"
              }
              stateRelatedMessage={
                formState.errors.payementRequestConfirmation?.message
              }
            />
            {!paymentRequestAlreadySent && (
              <FormButtons formState={formState} />
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default PaymentRequestUniRevaConfirmationPage;
