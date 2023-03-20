import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const ContactTimelineElement = () => {
  const { state } = useMainMachineContext();
  return (
    <TimelineElement title="Vos informations de contact" status="editable">
      {() => (
        <ul className="leading-tight">
          {state.context.contact?.phone && (
            <li data-test="project-home-contact-phone" className="mb-2">
              {state.context.contact?.phone}
            </li>
          )}
          {state.context.contact?.email && (
            <li data-test="project-home-contact-email" className="mb-2">
              {state.context.contact?.email}
            </li>
          )}
        </ul>
      )}
    </TimelineElement>
  );
};
