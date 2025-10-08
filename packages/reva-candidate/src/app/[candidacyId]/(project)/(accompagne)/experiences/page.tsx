"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { format } from "date-fns";
import Link from "next/link";

import { Duration } from "@/graphql/generated/graphql";

import { useExperiences } from "./experiences.hooks";

const durationToString: {
  [key in Duration]: string;
} = {
  unknown: "inconnue",
  lessThanOneYear: "de moins d'un an",
  betweenOneAndThreeYears: "entre 1 et 3 ans",
  moreThanThreeYears: "de plus de 3 ans",
  moreThanFiveYears: "de plus de 5 ans",
  moreThanTenYears: "de plus de 10 ans",
};

export default function ExperiencesPage() {
  const { candidacy, canEditCandidacy, candidacyAlreadySubmitted } =
    useExperiences();

  const experiences = candidacy?.experiences;

  return (
    <div className="flex flex-col w-full gap-6">
      <Breadcrumb
        currentPageLabel="Mes expériences"
        className="mb-0"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "/",
            },
          },
        ]}
      />
      <h1>Mes expériences</h1>
      <p>
        Complétez cette section avec vos différentes expériences
        professionnelles (salarié, entrepreneur, stage...) ou activités
        extra-professionnelles (bénévole).
      </p>
      <div className="flex flex-col gap-4 w-full">
        {experiences?.map((experience) => (
          <Card
            key={experience.id}
            background
            border
            desc={experience.description}
            enlargeLink
            footer={`${format(experience.startedAt, "MM/yyyy")} - ${durationToString[experience.duration]}`}
            linkProps={{
              href: `./${experience.id}`,
            }}
            size="small"
            title={experience.title}
            titleAs="h3"
          />
        ))}
      </div>
      {canEditCandidacy && !candidacyAlreadySubmitted && (
        <>
          <hr />
          <div>
            <Link
              href="./add"
              className="flex items-center gap-2 mb-6 fr-link w-fit bg-none"
            >
              <span className="fr-icon-add-line fr-icon--sm" />
              <span className="text-sm">Ajouter une expérience</span>
            </Link>
          </div>
        </>
      )}
      <Button priority="secondary" linkProps={{ href: "../" }}>
        Retour
      </Button>
    </div>
  );
}
