"use client";

import { PageLayout } from "@/layouts/page.layout";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { ProjectTimeline } from "@/components/legacy/organisms/ProjectTimeline/ProjectTimeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useRouter } from "next/navigation";

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
      <p className="max-w-xl my-4 pr-6 text-dsfrGray-500 text-base">
        Bienvenue sur votre espace ! Toutes les étapes et informations relatives
        à votre parcours VAE se trouvent ici.
      </p>

      <ProjectTimeline className="mt-8" />
    </PageLayout>
  );
}
