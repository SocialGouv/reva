import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const ProjectSubmissionTimelineElement = () => {
  const router = useRouter();

  const { isFeatureActive } = useFeatureFlipping();

  const candidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

  const { candidacyAlreadySubmitted, candidacy } = useCandidacy();

  const { organism } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!organism) {
    status = "disabled";
  } else if (candidacyAlreadySubmitted) {
    status = "readonly";
  }

  return (
    <TimelineElement title="Envoi de votre candidature" status={status}>
      {status === "readonly" ? (
        <span data-test="project-submitted-label">Statut : envoyée</span>
      ) : (
        <>
          {status === "active" && candidacyCreationDisabled && (
            <div className="flex items-center mb-4 max-w-xl">
              <span className="fr-icon fr-icon-warning-fill text-red-500 mr-2" />
              <p className="text-sm mb-0">
                Le dépôt de nouvelles candidatures est temporairement
                indisponible. Nous vous remercions de votre patience et nous
                excusons pour tout désagrément.
              </p>
            </div>
          )}
          <Button
            data-test="project-home-validate"
            disabled={candidacyCreationDisabled || status === "disabled"}
            nativeButtonProps={{
              onClick: () => {
                router.push("/submit-candidacy");
              },
            }}
          >
            Envoyez votre candidature
          </Button>
        </>
      )}
    </TimelineElement>
  );
};
