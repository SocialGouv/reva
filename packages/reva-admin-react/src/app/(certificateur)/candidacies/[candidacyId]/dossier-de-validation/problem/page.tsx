"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDossierDeValidationProblemPageLogic } from "@/app/(certificateur)/candidacies/[candidacyId]/dossier-de-validation/problem/dossierDeValidationProblemPageLogic";
import { BackButton } from "@/components/back-button/BackButton";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

const schema = z.object({
  decisionComment: sanitizedText(),
});

export type DossierDeValidationProblemFormData = z.infer<typeof schema>;

const DossierDeValidationProblemPage = () => {
  const router = useRouter();
  const { dossierDeValidation, candidacy, signalDossierDeValidationProblem } =
    useDossierDeValidationProblemPageLogic();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DossierDeValidationProblemFormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await signalDossierDeValidationProblem.mutateAsync({
        dossierDeValidationId: dossierDeValidation?.id || "",
        decisionComment: data.decisionComment,
      });
      successToast("Problème signalé avec succès");
      router.push(`/candidacies/${candidacy?.id}/dossier-de-validation`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });
  return (
    dossierDeValidation && (
      <div className="flex flex-col w-full">
        <BackButton
          href={`/candidacies/${candidacy?.id}/dossier-de-validation`}
        >
          Retour au dossier
        </BackButton>
        <h1>Correction du dossier de validation</h1>
        <form className="flex flex-col w-full" onSubmit={handleFormSubmit}>
          <div className="flex items-center gap-2 mb-8">
            <span className="uppercase text-xs font-bold">
              dossier déposé le :
            </span>
            <span>
              {format(
                dossierDeValidation?.dossierDeValidationSentAt,
                "dd/MM/yyyy",
              )}
            </span>
          </div>
          <Input
            textArea
            label="Précisez le ou les problèmes rencontrés"
            classes={{ nativeInputOrTextArea: "!min-h-[320px]" }}
            nativeTextAreaProps={{ ...register("decisionComment") }}
            state={errors.decisionComment ? "error" : "default"}
            stateRelatedMessage={errors.decisionComment?.message}
          />

          <SmallNotice>
            Ce commentaire sera transmis à l’Architecte accompagnateur de
            parcours.
          </SmallNotice>
          <Button className="ml-auto mt-10">Envoyer</Button>
        </form>
      </div>
    )
  );
};

export default DossierDeValidationProblemPage;
