import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  attestationURSSAF: z
    .object({
      0: z.undefined().or(z.instanceof(File)),
    })
    .optional(),

  justificatifIdentiteDirigeant: z
    .object({
      0: z.undefined().or(z.instanceof(File)),
    })
    .optional(),
  lettreDeDelegation: z
    .object({
      0: z.undefined().or(z.instanceof(File)),
    })
    .optional(),
  justificatifIdentiteDelegataire: z
    .object({
      0: z.undefined().or(z.instanceof(File)),
    })
    .optional(),
});

type FormData = z.infer<typeof schema>;

export const CompanyDocumentsStepForm = () => {
  const {
    goBackToPreviousStep,
    submitCompanyDocumentsStep,
    professionalSpaceInfos: { delegataire },
  } = useProfessionalSpaceSubscriptionContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = handleSubmit(
    (data) => {
      if (!data.attestationURSSAF?.[0]) {
        setError("attestationURSSAF", { message: "Ce champ est obligatoire" });
      }
      if (!data.justificatifIdentiteDirigeant?.[0]) {
        setError("justificatifIdentiteDirigeant", {
          message: "Ce champ est obligatoire",
        });
      }

      if (delegataire) {
        if (!data.lettreDeDelegation?.[0]) {
          setError("lettreDeDelegation", {
            message: "Ce champ est obligatoire",
          });
        }
        if (!data.justificatifIdentiteDelegataire?.[0]) {
          setError("justificatifIdentiteDelegataire", {
            message: "Ce champ est obligatoire",
          });
        }
      }
      console.log(data);
    },
    (e) => console.log(e),
  );

  return (
    <>
      <h1 className="mb-12">
        Étape 3 - Documents juridiques
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        title="Transmettez les différentes pièces justificatives "
        currentStep={3}
        stepCount={3}
      />
      <form className="flex flex-col gap-8" onSubmit={handleFormSubmit}>
        <FancyUpload
          title="Attestation URSSAF"
          description="L’attestation URSSAF doit afficher le code de sécurité -
         Exemples : attestation de vigilance, attestation fiscale."
          hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
          nativeInputProps={{
            ...register("attestationURSSAF"),
            accept: ".pdf",
          }}
          state={errors.attestationURSSAF ? "error" : "default"}
          stateRelatedMessage={errors.attestationURSSAF?.message}
        />
        <FancyUpload
          title="Copie du justificatif d'identité du dirigeant"
          description={
            <>
              Le dirigeant est la personne mentionnée sur l’attestation URSSAF.
              La pièce d’identité peut être une carte nationale d’identité en
              cours de validité ou périmée de moins de 5 ans (recto/verso) ou un
              passeport en cours de validité.
              <br />
              <strong>
                Veillez à ce que votre photocopie soit lisible, non tronquée,
                bien cadrée et y apporter la mention manuscrite « Certifiée
                conforme à l’original », datée et signée par le dirigeant.
              </strong>
            </>
          }
          hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
          nativeInputProps={{
            ...register("justificatifIdentiteDirigeant"),
            accept: ".pdf",
          }}
          state={errors.justificatifIdentiteDirigeant ? "error" : "default"}
          stateRelatedMessage={errors.justificatifIdentiteDirigeant?.message}
        />
        {delegataire && (
          <>
            <FancyUpload
              title="Lettre de délégation"
              description="Lettre de délégation de l'administration du compte FVAE signée par le dirigeant et le délégataire"
              hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
              nativeInputProps={{
                ...register("lettreDeDelegation"),
                accept: ".pdf",
              }}
              state={errors.lettreDeDelegation ? "error" : "default"}
              stateRelatedMessage={errors.lettreDeDelegation?.message}
            />

            <FancyUpload
              title="Copie du justificatif d'identité du délégataire"
              description={
                <>
                  La pièce d’identité peut être une carte nationale d’identité
                  en cours de validité ou périmée de moins de 5 ans
                  (recto/verso) ou un passeport en cours de validité.
                  <br />
                  <strong>
                    Veillez à ce que votre photocopie soit lisible, non
                    tronquée, bien cadrée.
                  </strong>
                </>
              }
              hint="Format supporté : PDF uniquement avec un poids maximum de 2Mo"
              nativeInputProps={{
                ...register("justificatifIdentiteDelegataire"),
                accept: ".pdf",
              }}
              state={
                errors.justificatifIdentiteDelegataire ? "error" : "default"
              }
              stateRelatedMessage={
                errors.justificatifIdentiteDelegataire?.message
              }
            />
          </>
        )}
        <div className="flex gap-2 mt-4 justify-between">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Retour
          </Button>
          <Button>Envoyer le formulaire</Button>
        </div>
      </form>
    </>
  );
};
