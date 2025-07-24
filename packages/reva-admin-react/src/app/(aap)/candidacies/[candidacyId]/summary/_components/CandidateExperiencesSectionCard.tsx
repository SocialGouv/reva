import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import Link from "next/link";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Duration } from "@/graphql/generated/graphql";

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

export const CandidateExperiencesSectionCard = ({
  candidacyId,
  experiences,
  isEditable = true,
}: {
  candidacyId: string;
  isEditable?: boolean;
  experiences: {
    id: string;
    title: string;
    description: string;
    duration: Duration;
    startedAt: Date;
  }[];
}) => {
  return (
    <GrayCard>
      <span className="text-2xl font-bold">Ses expériences</span>
      {experiences.map((e) => (
        <div key={e.id} className="flex flex-col gap-2 pt-6">
          <div className="flex justify-between text-xl font-bold mb-3">
            {e.title}
            {isEditable && (
              <Button
                priority="secondary"
                linkProps={{
                  href: `/candidacies/${candidacyId}/summary/candidate-experiences/${e.id}`,
                }}
              >
                Modifier
              </Button>
            )}
          </div>
          <div>Démarrée le {format(e.startedAt, "d MMMM yyyy")}</div>
          <div>Durée d'expérience {durationToString[e.duration]}</div>
          <div>{e.description}</div>
        </div>
      ))}
      {isEditable && (
        <div className="mt-6 pt-6 border-t-2">
          <Link
            className="bg-none p-2 fr-link fr-icon-add-line fr-link--icon-left"
            href={`/candidacies/${candidacyId}/summary/candidate-experiences/new`}
          >
            Ajouter une expérience
          </Link>
        </div>
      )}
    </GrayCard>
  );
};
