import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { FormatedCandidacy } from "@/app/home.loaders";
import { LinkButton } from "@/components/link-button/LinkButton";

export const GoalsTimelineElement = ({
  canEditCandidacy, candidacy
}: {
  canEditCandidacy: boolean;
  candidacy: FormatedCandidacy["candidacy"];
}) => {


  const { certification, goals } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!canEditCandidacy) {
    status = "readonly";
  } else if (!certification) {
    status = "disabled";
  } else if (goals.length > 0) {
    status = "editable";
  }

  return (
    <TimelineElement title="Vos objectifs" status={status}>
      <ul className="mt-0 mb-2 leading-tight">
        {goals.map((goal) => (
          <li className="mb-2" key={goal.id}>
            {goal.label}
          </li>
        ))}
      </ul>
      {status !== "readonly" && (
        // <Button
        //   data-test="project-home-edit-goals"
        //   priority="secondary"
        //   onClick={() => {
        //     router.push("/set-goals");
        //   }}
        //   disabled={status === "disabled"}
        // >
        //   {goals.length > 0
        //     ? "Modifiez vos objectifs"
        //     : "Choisir vos objectifs"}
        // </Button>
        <LinkButton href="/set-goals" data-test="project-home-edit-goals" disabled={status === "disabled"}>
          {goals.length > 0
            ? "Modifiez vos objectifs"
            : "Choisir vos objectifs"}
        </LinkButton>
      )}
    </TimelineElement>
  );
};
