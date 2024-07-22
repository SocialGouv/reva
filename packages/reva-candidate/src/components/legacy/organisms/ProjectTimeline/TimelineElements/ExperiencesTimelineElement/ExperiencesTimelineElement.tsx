import { Duration, Experience } from "@/graphql/generated/graphql";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";
import { FormatedCandidacy } from "@/app/home.loaders";
import { LinkButton } from "@/components/link-button/LinkButton";
import Link from "next/link";

export const ExperiencesTimelineElement = ({
  canEditCandidacy,
  candidacy,
}: {
  canEditCandidacy: boolean;
  candidacy: FormatedCandidacy["candidacy"];
}) => {

  const { goals, experiences } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!canEditCandidacy) {
    status = "readonly";
  } else if (goals.length == 0) {
    status = "disabled";
  } else if (experiences.length > 0) {
    status = "editable";
  }

  return (
    <TimelineElement title="Vos expériences" status={status}>
      <>
        {experiences.length != 0 && (
          <ul
            data-test="timeline-experiences-list"
            className="mb-2 mx-0 px-0 pb-2 flex flex-col space-y-3"
          >
            {experiences.map((experience) => (
              <ExperienceSummary
                key={experience.id}
                experience={experience}
                disabled={!canEditCandidacy}
              />
            ))}
          </ul>
        )}
        <div className="text-sm text-slate-400">
          {status !== "readonly" && (
            <LinkButton
              href="/experiences/add"
              data-test="timeline-add-experience"
            >
              Ajoutez une expérience
            </LinkButton>
          )}
        </div>
      </>
    </TimelineElement>
  );
};

const ExperienceSummary = ({
  experience,
  disabled,
}: {
  experience: Experience;
  disabled?: boolean;
}) => {
  return (
    <Link href={disabled ? "#" : `/experiences/${experience.id}`} className="bg-none">
      <li
        className={`flex gap-4 p-4 border border-dsfrBlue-500 ${
          disabled ? "default" : "cursor-pointer"
        }`}
      >
        <div className="flex flex-col">
          <p data-test="timeline-experience-title" className="font-medium mb-0">
            {experience.title}
          </p>
          <p data-test="timeline-experience-duration" className="mb-0">
            {durationToString[experience.duration]}
          </p>
        </div>
        {!disabled ? (
          <span className="fr-icon-arrow-right-s-line self-center ml-auto text-dsfrBlue-500" />
        ) : null}
      </li>
    </Link>
  );
};

const durationToString: {
  [key in Duration]: string;
} = {
  unknown: "Durée inconnue",
  lessThanOneYear: "Moins d'un an",
  betweenOneAndThreeYears: "Entre 1 et 3 ans",
  moreThanThreeYears: "Plus de 3 ans",
  moreThanFiveYears: "Plus de 5 ans",
  moreThanTenYears: "Plus de 10 ans",
};
