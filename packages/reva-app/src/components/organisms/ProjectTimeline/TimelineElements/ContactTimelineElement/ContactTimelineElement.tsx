import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const ContactTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  return (
    <TimelineElement title="Vos informations de contact" status="editable">
      {({ status }) => (
        <>
          <ul className="list-none mt-0 pl-0 leading-tight">
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
          {status !== "readonly" && (
            <Button
              data-test="project-home-update-contact"
              priority="secondary"
              onClick={() => mainService.send("UPDATE_CONTACT")}
              disabled={status === "disabled"}
            >
              Modifiez les informations
            </Button>
          )}
        </>
      )}
    </TimelineElement>
  );
};
