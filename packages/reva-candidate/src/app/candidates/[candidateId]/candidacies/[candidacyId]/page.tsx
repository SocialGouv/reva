"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { PageLayout } from "@/layouts/page.layout";

import Dashboard from "../../../../_components/home/dashboard/Dashboard";

import { useCandidate } from "./candidate.hook";

export default function Home() {
  const { candidate, certification } = useCandidate();

  const certificationLabel = certification
    ? `RNCP ${certification?.codeRncp} : ${certification?.label}`
    : "Certification non renseignée";

  const { isFeatureActive } = useFeatureFlipping();
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");

  return (
    <PageLayout data-testid="candidate-dashboard">
      {isMultiCandidacyFeatureActive && (
        <Breadcrumb
          currentPageLabel={certificationLabel}
          className="mb-4"
          segments={[
            {
              label: "Mes candidatures",
              linkProps: {
                href: `../`,
              },
            },
          ]}
        />
      )}

      <NameBadge
        as="h2"
        data-testid="project-home-fullname"
        firstname={candidate?.firstname}
        lastname={candidate?.lastname}
        givenName={candidate?.givenName || undefined}
      />
      <Dashboard />
    </PageLayout>
  );
}
