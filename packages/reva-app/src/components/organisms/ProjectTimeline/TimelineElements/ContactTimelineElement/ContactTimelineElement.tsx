import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const ContactTimelineElement = () => {
  const { state } = useMainMachineContext();
  return (
    <TimelineElement title="Vos informations de contact" status="editable">
      {() => (
        <>
          {state.context.contact?.phone && (
            <p data-test="project-home-contact-phone" className="mb-2">
              {state.context.contact?.phone}
            </p>
          )}
          {state.context.contact?.email && (
            <p data-test="project-home-contact-email">
              {state.context.contact?.email}
            </p>
          )}
        </>
      )}
    </TimelineElement>
  );
};
