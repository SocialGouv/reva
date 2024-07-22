"use client";
import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const ContactTimelineElement = () => {
  const router = useRouter();

  const { candidate } = useCandidacy();

  return (
    <TimelineElement title="Vos informations de contact" status="editable">
      <ul className="list-none mt-0 pl-0 leading-tight">
        {candidate.phone && (
          <li data-test="project-home-contact-phone" className="mb-2">
            {candidate.phone}
          </li>
        )}
        {candidate.email && (
          <li data-test="project-home-contact-email" className="mb-2">
            {candidate.email}
          </li>
        )}
      </ul>

      <Button
        data-test="project-home-update-contact"
        priority="secondary"
        onClick={() => {
          router.push("/update-contact");
        }}
      >
        Modifiez les informations
      </Button>
    </TimelineElement>
  );
};
