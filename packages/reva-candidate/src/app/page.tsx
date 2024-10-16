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
      <h1 className="text-lg font-bold text-dsfrGray-500">
        Bienvenue <span aria-hidden="true">🤝</span>,
      </h1>
      <NameBadge
        as="h2"
        className="mt-4"
        data-test="project-home-fullname"
        firstname={candidate.firstname}
        lastname={candidate.lastname}
      />
      <p className="max-w-xl my-4 pr-6 text-dsfrGray-500 text-base">
        Transmettez ici toutes les informations relatives à votre parcours VAE
        et suivez, étape par étape, l’avancement de votre démarche. Nous vous
        souhaitons une pleine réussite dans ce projet !
      </p>

      <ProjectTimeline className="mt-8" />
    </PageLayout>
  );
}
