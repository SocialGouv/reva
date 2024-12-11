"use client";

import { PageLayout } from "@/layouts/page.layout";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { ProjectTimeline } from "@/components/legacy/organisms/ProjectTimeline/ProjectTimeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { addMonths, isAfter, subWeeks } from "date-fns";
import { useRouter } from "next/navigation";
import { CandidacyBanner } from "./_components/CandidacyBanner";

export default function Home() {
  const { candidate, candidacy } = useCandidacy();
  const router = useRouter();
  const { isFeatureActive } = useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );

  if (candidacy?.candidacyDropOut) {
    router.push("/candidacy-dropout");
  }

  let shouldDisplayActualisationWarning: boolean = false;
  if (candidacy?.lastActivityDate) {
    // On affiche le message d'actualisation à partir de 5 mois et 2 semaines après la dernière activité
    const thresholdDate = subWeeks(addMonths(candidacy.lastActivityDate, 6), 2);
    shouldDisplayActualisationWarning = isAfter(new Date(), thresholdDate);
  }

  const lastActiveStatus = candidacy?.status;
  const isLastActiveStatusValidForActualisationWarning =
    lastActiveStatus === "DOSSIER_FAISABILITE_RECEVABLE" ||
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE";

  const displayActualisationWarning = !!(
    candidacy?.lastActivityDate &&
    candidacy?.feasibility?.decision === "ADMISSIBLE" &&
    candidacyActualisationFeatureIsActive &&
    shouldDisplayActualisationWarning &&
    isLastActiveStatusValidForActualisationWarning
  );

  const displayCaduqueWarning = !!(
    candidacy?.isCaduque && candidacyActualisationFeatureIsActive
  );

  return (
    <PageLayout data-test={`project-home-ready`}>
      <NameBadge
        as="h2"
        className="mt-4"
        data-test="project-home-fullname"
        firstname={candidate.firstname}
        lastname={candidate.lastname}
      />
      <CandidacyBanner
        displayCaduqueWarning={displayCaduqueWarning}
        displayActualisationWarning={displayActualisationWarning}
        lastActivityDate={candidacy?.lastActivityDate as number}
      />
      <ProjectTimeline className="mt-8" />
    </PageLayout>
  );
}
