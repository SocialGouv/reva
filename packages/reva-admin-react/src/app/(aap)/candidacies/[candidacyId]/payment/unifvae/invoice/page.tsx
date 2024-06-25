"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { usePaymentRequestUniFvaeInvoicePage } from "./paymentRequestUniFvaeInvoice.hook";
import { Gender } from "@/graphql/generated/graphql";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useParams } from "next/navigation";
import { z } from "zod";
import { Control, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

const paymentRequestUniFvaeSchema = z.object({
  invoiceNumber: z.string().min(1, "Ce champ est obligatoire"),
  individualEffectiveHourCount: z.number().default(0),
  individualEffectiveCost: z.number().default(0),
  collectiveEffectiveHourCount: z.number().default(0),
  collectiveEffectiveCost: z.number().default(0),
  mandatoryTrainingsEffectiveHourCount: z.number().default(0),
  mandatoryTrainingsEffectiveCost: z.number().default(0),
  basicSkillsEffectiveHourCount: z.number().default(0),
  basicSkillsEffectiveCost: z.number().default(0),
  certificateSkillsEffectiveHourCount: z.number().default(0),
  certificateSkillsEffectiveCost: z.number().default(0),
  otherTrainingEffectiveHourCount: z.number().default(0),
  otherTrainingEffectiveCost: z.number().default(0),
});

export type PaymentRequestUniFvaeFormData = z.infer<
  typeof paymentRequestUniFvaeSchema
>;

const PaymentRequestUniFvaeInvoicePage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy, getCandidacyStatus, createOrUpdatePaymentRequestUnifvae } =
    usePaymentRequestUniFvaeInvoicePage();

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

  const {
    register,
    control,
    reset,
    formState,
    formState: { errors },
    handleSubmit,
  } = useForm<PaymentRequestUniFvaeFormData>({
    resolver: zodResolver(paymentRequestUniFvaeSchema),
    defaultValues,
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
    } catch (e) {
      graphqlErrorToast(e);
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
                      <p>collectif</p>
                      <HourInput
                        name="collectiveEffectiveHourCount"
                        control={control}
                      />
                      <CostInput
                        name="collectiveEffectiveCost"
                        control={control}
                      />
                    </TableRow>
                    <TableRow>
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
                    <TableRow>
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
          <FormButtons formState={formState} />
        </form>
      )}
    </div>
  );
};

export default PaymentRequestUniFvaeInvoicePage;

const getGender = (gender?: Gender | null) => {
  switch (gender) {
    case "man":
      return "Homme";
    case "woman":
      return "Femme";
    default:
      return "Non précisé";
  }
};

const Info = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="flex flex-col">
    <dt className="text-xs font-bold uppercase mb-2">{title}</dt>
    <dd>{children}</dd>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <section className="flex flex-col pb-6">
    <h2 className="text-xl mb-4">{title}</h2>
    {children}
  </section>
);

const HourInput = ({
  control,
  name,
}: {
  control: Control<PaymentRequestUniFvaeFormData>;
  name: keyof PaymentRequestUniFvaeFormData;
}) => (
  <Input
    label="NOMBRE D'HEURES"
    hintText="Exemple: saisir 2.5 pour 2H30"
    nativeInputProps={{
      type: "number",
      step: "0.5",
      min: 0,
      inputMode: "decimal",
      ...control.register(name, { valueAsNumber: true }),
    }}
    state={control.getFieldState(name).error ? "error" : "default"}
    stateRelatedMessage={control.getFieldState(name)?.error?.message}
  />
);

const CostInput = ({
  control,
  name,
}: {
  control: Control<PaymentRequestUniFvaeFormData>;
  name: keyof PaymentRequestUniFvaeFormData;
}) => (
  <Input
    label="COÛT HORAIRE"
    hintText="Un décimal supérieur ou égal à 0"
    nativeInputProps={{
      type: "number",
      step: "0.01",
      min: 0,
      inputMode: "decimal",
      ...control.register(name, { valueAsNumber: true }),
    }}
    state={control.getFieldState(name).error ? "error" : "default"}
    stateRelatedMessage={control.getFieldState(name)?.error?.message}
  />
);

const TableRow = ({ children }: { children?: ReactNode }) => (
  <div className="flex gap-6 *:basis-1/3 px-6 py-6 [&:not(:last-child)]:border-b last:pb-2">
    {children}
  </div>
);
