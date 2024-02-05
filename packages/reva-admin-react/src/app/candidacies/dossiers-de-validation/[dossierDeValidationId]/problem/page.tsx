"use client";
import { useDossierDeValidationProblemPageLogic } from "@/app/candidacies/dossiers-de-validation/[dossierDeValidationId]/problem/dossierDeValidationProblemPageLogic";
import { format } from "date-fns";
import Link from "next/link";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";
const schema = z.object({
  decisionComment: z.string().min(1, "Ce champ est obligatoire"),
});

export type DossierDeValidationProblemFormData = z.infer<typeof schema>;

const DossierDeValidationProblemPage = () => {
  const router = useRouter();
  const { dossierDeValidation, signalDossierDeValidationProblem } =
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
      router.push(
        `/candidacies/dossiers-de-validation/${dossierDeValidation?.id}`,
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  });
  return (
    dossierDeValidation && (
      <div className="flex flex-col w-full">
        <Link
          href={`/candidacies/dossiers-de-validation/${dossierDeValidation?.id}`}
          className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
        >
          Retour au dossier
        </Link>
        <h1 className="text-3xl font-bold my-8">
          Dossier de validation - Signaler un problème
        </h1>
        <form className="flex flex-col w-full" onSubmit={handleFormSubmit}>
          <div className="flex items-center gap-2 mb-16">
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
