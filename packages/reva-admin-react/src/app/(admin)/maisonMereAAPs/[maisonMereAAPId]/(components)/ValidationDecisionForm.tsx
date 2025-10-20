import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateMaisonMereAAPLegalValidationDecision } from "./useUpdateMaisonMereAAPLegalValidationDecision";
import {
  ValidationDecisionFormData,
  validationDecisionFormSchema,
} from "./validationDecisionFormSchema";

export default function ValidationDecisionForm({
  maisonMereAAPId,
  aapUpdatedDocumentsAt,
}: {
  maisonMereAAPId: string;
  aapUpdatedDocumentsAt: number;
}) {
  const { updateMaisonMereAAPLegalValidationDecisionMutate } =
    useUpdateMaisonMereAAPLegalValidationDecision(maisonMereAAPId);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<ValidationDecisionFormData>({
    resolver: zodResolver(validationDecisionFormSchema),
    defaultValues: {
      decision: undefined,
      aapComment: "",
      internalComment: "",
    },
  });

  const onSubmit = async (formData: ValidationDecisionFormData) => {
    try {
      await updateMaisonMereAAPLegalValidationDecisionMutate({
        data: {
          maisonMereAAPId: maisonMereAAPId,
          decision: formData.decision,
          aapComment: formData.aapComment,
          internalComment: formData.internalComment,
          aapUpdatedDocumentsAt: aapUpdatedDocumentsAt,
        },
      });
      successToast("Décision enregistrée avec succès pour cet AAP");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          <fieldset className="grid pt-4">
            <RadioButtons
              small
              state={errors.decision ? "error" : "default"}
              stateRelatedMessage={errors.decision?.message}
              legend="Décision prise sur cette inscription"
              options={[
                {
                  label: "Validé",
                  nativeInputProps: {
                    value: "VALIDE",
                    ...register("decision"),
                  },
                },
                {
                  label: "Demande de précision",
                  nativeInputProps: {
                    value: "DEMANDE_DE_PRECISION",
                    ...register("decision"),
                  },
                },
              ]}
            />
            <Input
              className="mt-2"
              label="Commentaire à destination de l'AAP : "
              textArea
              state={errors.aapComment ? "error" : "default"}
              stateRelatedMessage={errors.aapComment?.message}
              nativeTextAreaProps={{
                rows: 4,
                ...register("aapComment"),
              }}
            />
            <SmallNotice>
              L'AAP recevra ce commentaire dans le courriel de décision
            </SmallNotice>
          </fieldset>
          <fieldset className="grid border p-4">
            <Input
              label="Description interne"
              state={errors.internalComment ? "error" : "default"}
              stateRelatedMessage={errors.internalComment?.message}
              hintText="(optionnel)"
              textArea
              nativeTextAreaProps={{
                rows: 10,
                ...register("internalComment"),
              }}
            />
            <SmallNotice>
              Non visible par l’AAP / Signer ce commentaire pour le suivi des
              décisions
            </SmallNotice>
          </fieldset>
        </div>
        <div className="w-full mt-8 flex flex-row justify-between">
          <Button
            priority="secondary"
            linkProps={{ href: "/subscriptions/check-legal-information/" }}
          >
            Retour
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}
