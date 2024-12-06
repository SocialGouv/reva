"use client";

import { PageLayout } from "@/layouts/page.layout";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { ProjectTimeline } from "@/components/legacy/organisms/ProjectTimeline/ProjectTimeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import Button from "@codegouvfr/react-dsfr/Button";
import { addMonths, format, subWeeks } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WelcomeMessage = () => (
  <p className="max-w-xl my-4 pr-6 text-dsfrGray-500 text-base">
    Bienvenue sur votre espace ! Toutes les étapes et informations relatives à
    votre parcours VAE se trouvent ici.
  </p>
);

const ActualisationSection = ({
  lastActivityDate,
}: {
  lastActivityDate: number;
}) => {
  // La candidature sera considérée comme caduque après cette date, 5 mois et 2 semaines après la dernière actualisation
  const thresholdDate = format(
    subWeeks(addMonths(lastActivityDate, 6), 2),
    "dd/MM/yyyy",
  );

  return (
    <div className="flex flex-col">
      <p className="my-4 pr-6">
        <strong>
          Actualisez-vous dès maintenant pour que votre recevabilité reste
          valable !
        </strong>{" "}
        Sans actualisation de votre part d'ici le {thresholdDate}, vous ne
        pourrez plus continuer votre parcours.
      </p>
      <Link href="/actualisation" className="self-end">
        <Button>S'actualiser</Button>
      </Link>
    </div>
  );
};

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

  const displayActualisationSection =
    candidacy?.lastActivityDate &&
    candidacy?.feasibility?.decision === "ADMISSIBLE" &&
    candidacyActualisationFeatureIsActive;

  return (
    <PageLayout data-test={`project-home-ready`}>
      <NameBadge
        as="h2"
        className="mt-4"
        data-test="project-home-fullname"
        firstname={candidate.firstname}
        lastname={candidate.lastname}
      />
      {displayActualisationSection ? (
        <ActualisationSection
          lastActivityDate={candidacy.lastActivityDate as number}
        />
      ) : (
        <WelcomeMessage />
      )}

      <ProjectTimeline className="mt-8" />
    </PageLayout>
  );
}
