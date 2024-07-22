"use client";
import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const GoalsTimelineElement = () => {
  const router = useRouter();

  const { canEditCandidacy, candidacy } = useCandidacy();

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
        <Button
          data-test="project-home-edit-goals"
          priority="secondary"
          onClick={() => {
            router.push("/set-goals");
          }}
          disabled={status === "disabled"}
        >
          {goals.length > 0
            ? "Modifiez vos objectifs"
            : "Choisir vos objectifs"}
        </Button>
      )}
    </TimelineElement>
  );
};
