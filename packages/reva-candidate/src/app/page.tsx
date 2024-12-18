"use client";

import { PageLayout } from "@/layouts/page.layout";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { ProjectTimeline } from "@/components/legacy/organisms/ProjectTimeline/ProjectTimeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useRouter } from "next/navigation";
import { CandidacyBanner } from "./_components/CandidacyBanner";

export default function Home() {
  const { candidate, candidacy } = useCandidacy();
  const router = useRouter();

  if (candidacy?.candidacyDropOut) {
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
