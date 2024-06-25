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
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { Section } from "../_components/form/Section";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

const paymentRequestUniFvaeUploadSchema = z.object({
  invoiceFile: z.object({
    0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
  }),

  certificateOfAttendanceFile: z.object({
    0: z.instanceof(File, { message: "Ce champ est obligatoire" }),
  }),

  confirmation1Checked: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher toutes les cases",
    }),
  }),

  confirmation2Checked: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher toutes les cases",
    }),
  }),

  confirmation3Checked: z.literal(true, {
    errorMap: () => ({
      message: "Veuillez cocher toutes les cases",
    }),
  }),
});

export type PaymentRequestUniFvaeUploadFormData = z.infer<
  typeof paymentRequestUniFvaeUploadSchema
>;

const PaymentRequestUniFvaeUploadPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    register,
    reset,
    formState,
    formState: { errors },
    handleSubmit,
  } = useForm<PaymentRequestUniFvaeUploadFormData>({
    resolver: zodResolver(paymentRequestUniFvaeUploadSchema),
  });

  const handleFormSubmit = handleSubmit(
    async (data) => {
      console.log({ data });
    },
    (e) => console.log(e),
  );

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <div className="flex flex-col w-full p-1 md:p-2">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1>Demande de paiement</h1>
      <FormOptionalFieldsDisclaimer />
      <Stepper
        title="Déposez les pièces justificicatives"
        currentStep={2}
        stepCount={2}
      />
      <hr />
      <form
        className="flex flex-col gap-6"
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <Section
          title="1 - Pièces jointes liées à la facturation"
          className="flex flex-col gap-6"
        >
          <FancyUpload
            title="Joindre la facture globale avec un RIB inclus"
            description="La facture doit être nette de TVA et doit contenir un RIB."
            hint="Format supporté : PDF uniquement avec un poids maximum de 10Mo"
            nativeInputProps={{
              ...register("invoiceFile"),
              accept: ".pdf",
            }}
            state={errors.invoiceFile ? "error" : "default"}
            stateRelatedMessage={errors.invoiceFile?.[0]?.message}
          />
          <FancyUpload
            title="Joindre le certificat de réalisation signé par le candidat et l'AAP"
            description="Le document est disponible dans l'espace documentaire et doit comprendre l'ensemble des actes réalisés pour le parcours (étude de faisabilité, heures d'accompagnement individuel et collectif, actes formatifs)."
            hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
            nativeInputProps={{
              ...register("certificateOfAttendanceFile"),
              accept: ".pdf",
            }}
            state={errors.invoiceFile ? "error" : "default"}
            stateRelatedMessage={
              errors.certificateOfAttendanceFile?.[0]?.message
            }
          />
        </Section>
        <Section title="2 - Confirmation">
          <Checkbox
            legend={
              <p className="font-medium">Avant de finaliser votre envoi :</p>
            }
            options={[
              {
                label:
                  "Je confirme le montant de paiement. Je ne pourrai pas modifier cette demande de paiement après son envoi.",
                nativeInputProps: { ...register("confirmation1Checked") },
              },
              {
                label:
                  "J’ai bien vérifié que le dossier de demande de paiement était correct et complet.",
                nativeInputProps: { ...register("confirmation2Checked") },
              },
              {
                label:
                  "J’ai bien vérifié que j’avais ajouté les différentes pièces justificatives nécessaires et qu’elles étaient correctes et complètes.",
                nativeInputProps: { ...register("confirmation3Checked") },
              },
            ]}
            state={
              errors.confirmation1Checked ||
              errors.confirmation2Checked ||
              errors.confirmation3Checked
                ? "error"
                : "default"
            }
            stateRelatedMessage={
              errors.confirmation1Checked?.message ||
              errors.confirmation2Checked?.message ||
              errors.confirmation3Checked?.message
            }
          />
        </Section>
        <FormButtons
          formState={formState}
          backUrl={`/candidacies/${candidacyId}/payment/unifvae/invoice/`}
          submitButtonLabel="Envoyer la demande de paiement"
        />
      </form>
    </div>
  );
};

export default PaymentRequestUniFvaeUploadPage;
