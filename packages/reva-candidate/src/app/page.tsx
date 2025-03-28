"use client";

import { PageLayout } from "@/layouts/page.layout";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { ProjectTimeline } from "@/components/legacy/organisms/ProjectTimeline/ProjectTimeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { CandidacyBanner } from "./_components/CandidacyBanner";
import Dashboard from "./_components/dashboard/Dashboard";

export default function Home() {
  const { candidate } = useCandidacy();
  const { isFeatureActive } = useFeatureFlipping();
  const isCandidateDashboardActive = isFeatureActive("CANDIDATE_DASHBOARD");

  return (
    <>
      {isCandidateDashboardActive ? (
        <PageLayout data-test="candidate-dashboard">
          <NameBadge
            as="h2"
            data-test="project-home-fullname"
            firstname={candidate.firstname}
            lastname={candidate.lastname}
          />
          <Dashboard />
        </PageLayout>
      ) : (
        <PageLayout data-test="project-home-ready">
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
      )}
    </>
  );
}
