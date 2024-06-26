"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { usePaymentRequestUniFvaeInvoicePage } from "./paymentRequestUniFvaeInvoice.hook";
import { useCallback, useEffect, useMemo } from "react";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CostInput } from "./_components/form/CostInput";
import { HourInput } from "./_components/form/HourInput";
import { Info } from "./_components/form/Info";
import { Section } from "../_components/form/Section";
import { TableRow } from "./_components/form/TableRow";
import {
  PaymentRequestUniFvaeInvoiceFormData,
  paymentRequestUniFvaeInvoiceSchema,
} from "./paymentRequestUnifvaeInvoiceFormSchema";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";

const PaymentRequestUniFvaeInvoicePage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const {
    candidacy,
    getCandidacyStatus,
    createOrUpdatePaymentRequestUnifvae,
    getGender,
  } = usePaymentRequestUniFvaeInvoicePage();

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: candidacy?.paymentRequestUnifvae?.invoiceNumber,
      individualEffectiveHourCount:
        candidacy?.paymentRequestUnifvae?.individualEffectiveHourCount || 0,
      individualEffectiveCost:
        candidacy?.paymentRequestUnifvae?.individualEffectiveCost || 0,
      collectiveEffectiveHourCount:
        candidacy?.paymentRequestUnifvae?.collectiveEffectiveHourCount || 0,
      collectiveEffectiveCost:
        candidacy?.paymentRequestUnifvae?.collectiveEffectiveCost || 0,
      mandatoryTrainingsEffectiveHourCount:
        candidacy?.paymentRequestUnifvae
          ?.mandatoryTrainingsEffectiveHourCount || 0,
      mandatoryTrainingsEffectiveCost:
        candidacy?.paymentRequestUnifvae?.mandatoryTrainingsEffectiveCost || 0,
      basicSkillsEffectiveHourCount:
        candidacy?.paymentRequestUnifvae?.basicSkillsEffectiveHourCount || 0,
      basicSkillsEffectiveCost:
        candidacy?.paymentRequestUnifvae?.basicSkillsEffectiveCost || 0,
      certificateSkillsEffectiveHourCount:
        candidacy?.paymentRequestUnifvae?.certificateSkillsEffectiveHourCount ||
        0,
      certificateSkillsEffectiveCost:
        candidacy?.paymentRequestUnifvae?.certificateSkillsEffectiveCost || 0,
      otherTrainingEffectiveHourCount:
        candidacy?.paymentRequestUnifvae?.otherTrainingEffectiveHourCount || 0,
      otherTrainingEffectiveCost:
        candidacy?.paymentRequestUnifvae?.otherTrainingEffectiveCost || 0,
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
  } = useForm<PaymentRequestUniFvaeInvoiceFormData>({
    resolver: zodResolver(paymentRequestUniFvaeInvoiceSchema),
    defaultValues,
    disabled: paymentRequestAlreadySent,
  });

  const {
    individualEffectiveHourCount,
    individualEffectiveCost,
    collectiveEffectiveHourCount,
    collectiveEffectiveCost,
    mandatoryTrainingsEffectiveHourCount,
    mandatoryTrainingsEffectiveCost,
    basicSkillsEffectiveHourCount,
    basicSkillsEffectiveCost,
    certificateSkillsEffectiveHourCount,
    certificateSkillsEffectiveCost,
    otherTrainingEffectiveHourCount,
    otherTrainingEffectiveCost,
  } = useWatch({ control });

  const supportHourCountTotal =
    (individualEffectiveHourCount || 0) + (collectiveEffectiveHourCount || 0);

  const supportEffectiveCostTotal =
    (individualEffectiveHourCount || 0) * (individualEffectiveCost || 0) +
    (collectiveEffectiveHourCount || 0) * (collectiveEffectiveCost || 0);

  const trainingHourCountTotal =
    (mandatoryTrainingsEffectiveHourCount || 0) +
    (basicSkillsEffectiveHourCount || 0) +
    (certificateSkillsEffectiveHourCount || 0) +
    (otherTrainingEffectiveHourCount || 0);

  const trainingCostTotal =
    (mandatoryTrainingsEffectiveHourCount || 0) *
      (mandatoryTrainingsEffectiveCost || 0) +
    (basicSkillsEffectiveHourCount || 0) * (basicSkillsEffectiveCost || 0) +
    (certificateSkillsEffectiveHourCount || 0) *
      (certificateSkillsEffectiveCost || 0) +
    (otherTrainingEffectiveHourCount || 0) * (otherTrainingEffectiveCost || 0);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await createOrUpdatePaymentRequestUnifvae.mutateAsync({
        paymentRequest: data,
      });
      successToast("Modifications enregistrées");
      router.push(`/candidacies/${candidacyId}/payment/unifvae/upload`);
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
          ) as keyof PaymentRequestUniFvaeInvoiceFormData;

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
      <Alert
        className="mb-6"
        severity="info"
        title={
          <span className="font-normal">
            <p>
              <strong>
                Avez-vous obtenu votre accord de prise en charge ?
              </strong>{" "}
              Si vous n’avez pas obtenu d’accord de prise en charge de la part
              d’Uniformation, votre demande de paiement ne sera pas traitée pour
              le moment.
            </p>
          </span>
        }
      />
      <Stepper
        title="Renseignez les heures d’accompagnement"
        currentStep={1}
        stepCount={2}
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
          <Section title="1. Informations du candidat">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Info title="Nom">{candidacy.candidate?.lastname}</Info>
              <Info title="Prénom">{candidacy.candidate?.firstname}</Info>
              <Info title="Genre">
                {getGender(candidacy.candidate?.gender)}
              </Info>
            </dl>
          </Section>
          <hr />
          <Section title="2. Choix du candidat">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Info title="Certification choisie">
                {candidacy.certification?.label}
              </Info>
              <Info title="Accompagnateur choisi">
                {candidacy.organism?.label}
              </Info>
            </dl>
          </Section>
          <hr />
          <Section title="3. Numéro de prise en charge France VAE">
            <span>{candidacy.fundingRequestUnifvae?.numAction}</span>
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
          <Section title="5. Accompagnement">
            <dl className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
              <Info title="Forfait d’étude de faisabilité et entretien post-jury">
                <p className="flex text-dsfr-orange-500">
                  <span
                    className="fr-icon-warning-fill fr-icon--sm mr-1"
                    aria-hidden
                  />
                  Ne pourra être demandé que si l'étude a été réalisée dans sa
                  totalité.
                </p>
              </Info>
              <Info title="Forfait">300€ net</Info>
            </dl>
            {candidacy?.feasibility?.decision === "ADMISSIBLE" && (
              <>
                <Alert
                  severity="info"
                  title={
                    <p className="font-normal">
                      Les montants remplis sont tous net de TVA.
                    </p>
                  }
                />

                <fieldset className="mt-12">
                  <legend className="mb-6 font-medium">
                    Accompagnement (optionnel)
                  </legend>
                  <div className="flex flex-col flew-wrap w-full border-[1px] border-default-grey rounded-lg">
                    <TableRow>
                      <p>Individuel</p>
                      <HourInput
                        name="individualEffectiveHourCount"
                        control={control}
                      />
                      <CostInput
                        name="individualEffectiveCost"
                        control={control}
                      />
                    </TableRow>
                    <TableRow>
                      <p>Collectif</p>
                      <HourInput
                        name="collectiveEffectiveHourCount"
                        control={control}
                      />
                      <CostInput
                        name="collectiveEffectiveCost"
                        control={control}
                      />
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
                    <p className="px-6 pt-6 flex text-xs text-dsfr-orange-500">
                      <span
                        className="fr-icon-warning-fill fr-icon--sm mr-1"
                        aria-hidden
                      />
                      Merci de prendre en compte que les actes formatifs doivent
                      être facturés au tarif réel, plafonné à 25€ de l'heure.
                      Des contrôles aléatoires seront effectués avant tout
                      paiement, veuillez donc conserver et être prêt à présenter
                      les factures acquittées correspondant aux actes formatifs,
                      sur demande d'Uniformation.
                    </p>
                    <TableRow>
                      <div className="flex flex-col">
                        <p className="mb-2">Formation obligatoire</p>
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
                        <p className="mb-2">Savoir de base</p>
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
                        <p className="mb-2">Autres</p>
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
                <TableRow>
                  <p className="font-bold">Total</p>
                  <p>{supportHourCountTotal + trainingHourCountTotal} h</p>
                  <p>
                    {(supportEffectiveCostTotal + trainingCostTotal).toFixed(2)}{" "}
                    €
                  </p>
                </TableRow>
              </>
            )}
          </Section>
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

export default PaymentRequestUniFvaeInvoicePage;
