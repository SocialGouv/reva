"use client";

import { redirect, useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { BackButton } from "@/components/back-button/BackButton";
import { graphqlErrorToast } from "@/components/toast/toast";
import { useSubmitCandidacy } from "./submit-candidacy.hooks";

export default function SubmitCandidacy() {
  const router = useRouter();

  const { canEditCandidacy, candidacy, refetch, candidacyAlreadySubmitted } =
    useCandidacy();

  const { submitCandidacy } = useSubmitCandidacy();

  if (!canEditCandidacy) {
    redirect("/");
  }

  const onSubmitCandidacy = async () => {
    try {
      const response = await submitCandidacy.mutateAsync({
        candidacyId: candidacy.id,
      });
      if (response) {
        refetch();
        router.push("/");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div>
      <h2 className="mt-6 mb-4">Envoi de votre candidature</h2>

      <p>
        Vérifiez les informations puis validez l'envoi de votre candidature à
        l'AAP que vous avez choisi. Il se chargera ensuite de vous contacter
        pour fixer le premier rendez-vous.
      </p>
      <div className="flex justify-between">
        <BackButton navigateBack={() => router.push("/")} />
        <Button
          data-test="project-submit"
          disabled={candidacyAlreadySubmitted || !candidacy.organism}
          onClick={onSubmitCandidacy}
        >
          Envoyer
        </Button>
      </div>
    </div>
  );
}
