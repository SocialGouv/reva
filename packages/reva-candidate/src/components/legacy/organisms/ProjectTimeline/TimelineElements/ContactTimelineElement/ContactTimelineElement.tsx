import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";
import { LinkButton } from "@/components/link-button/LinkButton";
import { FormatedCandidacy } from "@/app/home.loaders";

export const ContactTimelineElement = ({
  candidate,
}: {
  candidate: FormatedCandidacy["candidate"];
}) => {
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

      <LinkButton
        href="/update-contact"
        data-test="project-home-update-contact"
      >
        Modifiez les informations
      </LinkButton>
    </TimelineElement>
  );
};
