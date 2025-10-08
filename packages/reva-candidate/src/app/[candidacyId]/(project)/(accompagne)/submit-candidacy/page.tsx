"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BackButton } from "@/components/back-button/BackButton";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { graphqlErrorToast } from "@/components/toast/toast";

import CandidacySubmissionSuccessNotice from "./CandidacySubmissionSuccessNotice";
import CandidateSectionSubmitCandidacy from "./CandidateSectionSubmitCandidacy";
import CertificationSectionSubmitCandidacy from "./CertificationSectionSubmitCandidacy";
import ContactSectionSubmitCandidacy from "./ContactSectionSubmitCandidacy";
import ExperiencesSectionSubmitCandidacy from "./ExperiencesSectionSubmitCandidacy";
import GoalsSectionSubmitCandidacy from "./GoalsSectionSubmitCandidacy";
import { useSubmitCandidacyForDashboard } from "./submit-candidacy-dashboard.hook";
import { useSubmitCandidacy } from "./submit-candidacy.hook";

export default function SubmitCandidacy() {
  const router = useRouter();
  const [candidacySubmissionSuccess, setCandidacySubmissionSuccess] =
    useState(false);

  const { submitCandidacy } = useSubmitCandidacy();
  const {
    candidate,
    candidacy,
    certification,
    canSubmitCandidacy,
    candidacyAlreadySubmitted,
  } = useSubmitCandidacyForDashboard();

  if (!candidacy || !candidate) {
    return <LoaderWithLayout />;
  }

  const onSubmitCandidacy = async () => {
    try {
      await submitCandidacy.mutateAsync({
        candidacyId: candidacy.id,
      });

      setCandidacySubmissionSuccess(true);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (candidacySubmissionSuccess) {
    return <CandidacySubmissionSuccessNotice />;
  }

  return (
    <div>
      <Breadcrumb
        currentPageLabel="Envoi de la candidature"
        className="mb-0"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />
      <h2 className="mt-6 mb-4">Envoi de votre candidature</h2>
      <p className="mb-12">
        Vérifiez les informations puis validez l'envoi de votre candidature à
        l'accompagnateur que vous avez choisi. Il se chargera ensuite de vous
        contacter pour fixer le premier rendez-vous.
      </p>
      <CandidateSectionSubmitCandidacy candidate={candidate} />
      <CertificationSectionSubmitCandidacy
        isAapAvailable={!!certification?.isAapAvailable}
        codeRncp={certification?.codeRncp}
        label={certification?.label}
      />
      <ExperiencesSectionSubmitCandidacy experiences={candidacy?.experiences} />
      <GoalsSectionSubmitCandidacy goals={candidacy?.goals} />
      <ContactSectionSubmitCandidacy organism={candidacy?.organism} />
      <div className="flex justify-between mt-12">
        <BackButton navigateBack={() => router.push("../")} />
        <Button
          data-test="project-submit"
          onClick={onSubmitCandidacy}
          disabled={
            candidacyAlreadySubmitted ||
            !canSubmitCandidacy ||
            submitCandidacy.isPending
          }
        >
          Envoyer
        </Button>
      </div>
    </div>
  );
}
