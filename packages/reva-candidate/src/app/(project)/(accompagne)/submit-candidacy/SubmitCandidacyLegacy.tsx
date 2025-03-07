"use client";

import { redirect, useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { graphqlErrorToast } from "@/components/toast/toast";
import { useSubmitCandidacy } from "./submit-candidacy.hooks";

export default function SubmitCandidacy() {
  const router = useRouter();

  const { canEditCandidacy, candidacy, candidacyAlreadySubmitted } =
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
        router.push("/");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout
      className="max-w-2xl"
      title="Envoi de votre candidature"
      displayBackToHome
    >
      <h2 className="mt-6 mb-4">Envoi de votre candidature</h2>

      <p>
        Après réception de votre candidature, votre organisme d'accompagnement
        vous contactera pour fixer un rendez-vous pour définir votre parcours.
      </p>

      <Button
        className="justify-center w-[100%]  md:w-fit"
        data-test="project-submit"
        disabled={candidacyAlreadySubmitted || !candidacy.organism}
        nativeButtonProps={{
          onClick: onSubmitCandidacy,
        }}
      >
        Envoyer
      </Button>
    </PageLayout>
  );
}
