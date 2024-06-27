"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { usePaymentRequestUniRevaInvoicePage } from "./paymentRequestUniRevaInvoice.hook";
import { useCallback, useEffect, useMemo } from "react";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CostInput } from "../../_components/form/CostInput";
import { HourInput } from "../../_components/form/HourInput";
import { Section } from "../../_components/form/Section";
import { TableRow } from "../../_components/form/TableRow";
import {
  PaymentRequestUniRevaInvoiceFormData,
  paymentRequestUniRevaInvoiceSchema,
} from "./paymentRequestUniRevaInvoiceFormSchema";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { costsAndHoursTotal } from "../paymentRequestUniRevaPaymentUtils";

const PaymentRequestUniRevaInvoicePage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const { candidacy, getCandidacyStatus, createOrUpdatePaymentRequestUniReva } =
    usePaymentRequestUniRevaInvoicePage();

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: candidacy?.paymentRequest?.invoiceNumber,
      individualEffectiveHourCount:
        candidacy?.paymentRequest?.individualEffectiveHourCount || 0,
      individualEffectiveCost:
        candidacy?.paymentRequest?.individualEffectiveCost || 0,
      collectiveEffectiveHourCount:
        candidacy?.paymentRequest?.collectiveEffectiveHourCount || 0,
      collectiveEffectiveCost:
        candidacy?.paymentRequest?.collectiveEffectiveCost || 0,
      mandatoryTrainingsEffectiveHourCount:
        candidacy?.paymentRequest?.mandatoryTrainingsEffectiveHourCount || 0,
      mandatoryTrainingsEffectiveCost:
        candidacy?.paymentRequest?.mandatoryTrainingsEffectiveCost || 0,
      basicSkillsEffectiveHourCount:
        candidacy?.paymentRequest?.basicSkillsEffectiveHourCount || 0,
      basicSkillsEffectiveCost:
        candidacy?.paymentRequest?.basicSkillsEffectiveCost || 0,
      certificateSkillsEffectiveHourCount:
        candidacy?.paymentRequest?.certificateSkillsEffectiveHourCount || 0,
      certificateSkillsEffectiveCost:
        candidacy?.paymentRequest?.certificateSkillsEffectiveCost || 0,
      otherTrainingEffectiveHourCount:
        candidacy?.paymentRequest?.otherTrainingEffectiveHourCount || 0,
      otherTrainingEffectiveCost:
        candidacy?.paymentRequest?.otherTrainingEffectiveCost || 0,
      diagnosisEffectiveHourCount:
        candidacy?.paymentRequest?.diagnosisEffectiveHourCount || 0,
      diagnosisEffectiveCost:
        candidacy?.paymentRequest?.diagnosisEffectiveCost || 0,
      postExamEffectiveHourCount:
        candidacy?.paymentRequest?.postExamEffectiveHourCount || 0,
      postExamEffectiveCost:
        candidacy?.paymentRequest?.postExamEffectiveCost || 0,
      examEffectiveHourCount:
        candidacy?.paymentRequest?.examEffectiveHourCount || 0,
      examEffectiveCost: candidacy?.paymentRequest?.examEffectiveCost || 0,
    }),
    [candidacy],
  );

  const activeCandidacyStatus = candidacy?.candidacyStatuses?.find(
    (c) => c.isActive,
  )?.status;

  const paymentRequestAlreadySent =
    activeCandidacyStatus &&
    isCandidacyStatusEqualOrAbove(
      activeCandidacyStatus,
      "DEMANDE_PAIEMENT_ENVOYEE",
    );

  const {
    register,
    control,
    reset,
    formState,
    formState: { errors },
    handleSubmit,
    setError,
    setFocus,
  } = useForm<PaymentRequestUniRevaInvoiceFormData>({
    resolver: zodResolver(paymentRequestUniRevaInvoiceSchema),
    defaultValues,
    disabled: paymentRequestAlreadySent,
  });

  const formValues = useWatch({ control });

  const {
    trainingHourCountTotal,
    trainingCostTotal,
    meetingHourCountTotal,
    meetingCostTotal,
    supportEffectiveCostTotal,
    supportHourCountTotal,
    totalHourCount,
    totalCost,
  } = costsAndHoursTotal(formValues);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await createOrUpdatePaymentRequestUniReva.mutateAsync({
        paymentRequest: data,
      });
      successToast("Modifications enregistrées");
      router.push(`/candidacies/${candidacyId}/payment/unireva/upload`);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("input.")) {
        const [, name, message] =
          ((
            e as unknown as { response: { errors: { message: string }[] } }
          ).response.errors[0].message.match(/input\.([^:]*): (.*)/) as [
            unknown,
            string,
            string,
          ]) || [];

        const fieldName = name
          .replace("Cost", "EffectiveCost")
          .replace(
            "Hour",
            "EffectiveHour",
          ) as keyof PaymentRequestUniRevaInvoiceFormData;

        setError(fieldName, {
          message,
        });
        setFocus(fieldName);
      } else {
        graphqlErrorToast(e);
      }
    }
  });

  const handleReset = useCallback(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <div className="flex flex-col w-full p-1 md:p-2">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1>Demande de paiement</h1>
      <FormOptionalFieldsDisclaimer />
      <Stepper
        title="Renseignez les heures d’accompagnement"
        currentStep={1}
        stepCount={3}
        nextTitle="Déposez les pièces justificicatives"
      />
      <hr />
      {getCandidacyStatus === "success" && candidacy && (
        <form
          className="flex flex-col"
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <Section title="1. Informations des prestations">
            <h3 className="text-base mb-2">
              Certification choisie par le candidat
            </h3>
            <p>{candidacy.certification?.label}</p>
          </Section>
          <hr />
          <Section title="2. Numéro de prise en charge France VAE">
            <span>{candidacy.fundingRequest?.numAction}</span>
          </Section>
          <hr />
          <Section title="3. Parcours personnalisé">
            <fieldset className="mt-12">
              <legend className="mb-6 font-medium">Entretien(s)</legend>
              <div className="flex flex-col flew-wrap w-full border-[1px] border-default-grey rounded-lg">
                <TableRow>
                  <p>Entretien(s) de faisabilité</p>
                  <HourInput
                    name="diagnosisEffectiveHourCount"
                    control={control}
                  />
                  <CostInput name="diagnosisEffectiveCost" control={control} />
                </TableRow>
                <TableRow>
                  <p>Entretien post jury</p>
                  <HourInput
                    name="postExamEffectiveHourCount"
                    control={control}
                  />
                  <CostInput name="postExamEffectiveCost" control={control} />
                </TableRow>
                <TableRow className="font-medium">
                  <p>Sous-total des entretiens</p>
                  <p>{meetingHourCountTotal} h</p>
                  <p>{meetingCostTotal.toFixed(2)} €</p>
                </TableRow>
              </div>
            </fieldset>
            <fieldset className="mt-12">
              <legend className="mb-6 font-medium">Accompagnement</legend>
              <div className="flex flex-col flew-wrap w-full border-[1px] border-default-grey rounded-lg">
                <TableRow>
                  <p>Individuel</p>
                  <HourInput
                    name="individualEffectiveHourCount"
                    control={control}
                  />
                  <CostInput name="individualEffectiveCost" control={control} />
                </TableRow>
                <TableRow>
                  <p>Collectif</p>
                  <HourInput
                    name="collectiveEffectiveHourCount"
                    control={control}
                  />
                  <CostInput name="collectiveEffectiveCost" control={control} />
                </TableRow>
                <TableRow className="font-medium">
                  <p>Sous-total des accompagnements</p>
                  <p>{supportHourCountTotal} h</p>
                  <p>{supportEffectiveCostTotal.toFixed(2)} €</p>
                </TableRow>
              </div>
            </fieldset>
            <fieldset className="mt-12">
              <legend className="mb-6 font-medium">
                Compléments formatifs
              </legend>
              <div className="flex flex-col flew-wrap w-full border-[1px] border-default-grey rounded-lg">
                <TableRow>
                  <div className="flex flex-col">
                    <p className="mb-2">Formations</p>
                    <div className="flex flex-wrap gap-3">
                      {candidacy.mandatoryTrainings.map((mt) => (
                        <Tag key={mt.id} small>
                          {mt.label}
                        </Tag>
                      ))}
                    </div>
                    {!candidacy.mandatoryTrainings.length && (
                      <p className="text-sm text-gray-500 italic">
                        Aucun élément séléctionné
                      </p>
                    )}
                  </div>
                  <HourInput
                    name="mandatoryTrainingsEffectiveHourCount"
                    control={control}
                  />
                  <CostInput
                    name="mandatoryTrainingsEffectiveCost"
                    control={control}
                  />
                </TableRow>
                <TableRow>
                  <div className="flex flex-col">
                    <p className="mb-2">Savoirs de base</p>
                    <div className="flex flex-wrap gap-3">
                      {candidacy.basicSkills.map((bs) => (
                        <Tag key={bs.id} small>
                          {bs.label}
                        </Tag>
                      ))}
                    </div>
                    {!candidacy.basicSkills.length && (
                      <p className="text-sm text-gray-500 italic">
                        Aucun élément séléctionné
                      </p>
                    )}
                  </div>
                  <HourInput
                    name="basicSkillsEffectiveHourCount"
                    control={control}
                  />
                  <CostInput
                    name="basicSkillsEffectiveCost"
                    control={control}
                  />
                </TableRow>
                <TableRow>
                  <div className="flex flex-col">
                    <p className="mb-2">Bloc de compétences</p>
                    <pre className="text-sm text-gray-500 italic">
                      {candidacy.certificateSkills || "Non précisé"}
                    </pre>
                  </div>
                  <HourInput
                    name="certificateSkillsEffectiveHourCount"
                    control={control}
                  />
                  <CostInput
                    name="certificateSkillsEffectiveCost"
                    control={control}
                  />
                </TableRow>
                <TableRow>
                  <div className="flex flex-col">
                    <p className="mb-2">Autres actions de formations</p>
                    <pre className="text-sm text-gray-500 italic">
                      {candidacy.otherTraining || "Non précisé"}
                    </pre>
                  </div>
                  <HourInput
                    name="otherTrainingEffectiveHourCount"
                    control={control}
                  />
                  <CostInput
                    name="otherTrainingEffectiveCost"
                    control={control}
                  />
                </TableRow>
                <TableRow className="font-medium">
                  <p>Sous-total des compléments formatifs</p>
                  <p>{trainingHourCountTotal} h</p>
                  <p>{trainingCostTotal.toFixed(2)} €</p>
                </TableRow>
              </div>
            </fieldset>
            <fieldset className="mt-12">
              <legend className="mb-6 font-medium">Prestation jury</legend>
              <div className="flex flex-col flew-wrap w-full border-[1px] border-default-grey rounded-lg">
                <TableRow>
                  <p>Jury</p>
                  <HourInput name="examEffectiveHourCount" control={control} />
                  <CostInput name="examEffectiveCost" control={control} />
                </TableRow>
              </div>
            </fieldset>
            <TableRow>
              <p className="font-bold">Total</p>
              <p>{totalHourCount} h</p>
              <p>{totalCost.toFixed(2)} €</p>
            </TableRow>
          </Section>
          <hr />
          <Section title="4. Numéro de facture">
            <Input
              className="max-w-xs"
              label="Numéro de facture"
              nativeInputProps={register("invoiceNumber")}
              state={errors.invoiceNumber ? "error" : "default"}
              stateRelatedMessage={errors.invoiceNumber?.message}
            />
          </Section>
          <hr />

          {!paymentRequestAlreadySent && (
            <FormButtons
              formState={{
                isDirty: true,
                isSubmitting: formState.isSubmitting,
              }}
            />
          )}
        </form>
      )}
    </div>
  );
};

export default PaymentRequestUniRevaInvoicePage;
