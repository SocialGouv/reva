"use client";

import { PageLayout } from "@/layouts/page.layout";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { ProjectTimeline } from "@/components/legacy/organisms/ProjectTimeline/ProjectTimeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { useRouter } from "next/navigation";
import { CandidacyBanner } from "./_components/CandidacyBanner";

export default function Home() {
  const { candidate, candidacy } = useCandidacy();
  const router = useRouter();
  const { isFeatureActive, status } = useFeatureFlipping();

  const candidateDropOutConfirmationFeatureActive = isFeatureActive(
    "CANDIDACY_DROP_OUT_CANDIDATE_CONFIRMATION",
  );

  if (status !== "INITIALIZED") {
    return null;
  }

  if (
    candidacy?.candidacyDropOut &&
    !candidateDropOutConfirmationFeatureActive
  ) {
    router.push("/candidacy-dropout");
  }

  return (
    <PageLayout data-test={`project-home-ready`}>
      <NameBadge
        as="h2"
        className="mt-4"
        data-test="project-home-fullname"
        firstname={candidate.firstname}
        lastname={candidate.lastname}
      />
      <CandidacyBanner />
      <ProjectTimeline className="mt-8" />
    </PageLayout>
  );
}
