import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useProjectTimeline } from "components/organisms/ProjectTimeline/ProjectTimeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const OrganismTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  const { getTimelineElementStatus } = useProjectTimeline();

  return (
    <TimelineElement
      title="Votre organisme d'accompagnement"
      description="Il vous guide tout au long du parcours"
      status={getTimelineElementStatus({
        previousElementFilled: !!state.context.experiences.rest.length,
        currentElementFilled: !!state.context.organism,
      })}
    >
      {({ status }) => (
        <>
          {state.context.organism && (
            <div className="flex flex-col p-4 border border-dsfrBlue-500">
              {state.context.organism?.label && (
                <h3
                  data-test="project-home-organism-label"
                  className="text-base font-medium"
                >
                  {state.context.organism?.label}
                </h3>
              )}
              <address className="not-italic">
                <p>
                  <span data-test="project-home-organism-email">
                    {state.context.organism.contactAdministrativeEmail}
                  </span>
                  {state.context.organism.contactAdministrativePhone && (
                    <>
                      &nbsp; - &nbsp;
                      <span data-test="project-home-organism-phone">
                        {state.context.organism.contactAdministrativePhone}
                      </span>
                    </>
                  )}
                </p>
              </address>
            </div>
          )}
          <div className="mt-4 text-sm text-slate-400">
            {status !== "readonly" && (
              <Button
                data-test="project-home-edit-organism"
                priority="secondary"
                onClick={() => mainService.send("EDIT_ORGANISM")}
                disabled={status === "disabled"}
              >
                {state.context.organism
                  ? "Modifiez votre organisme d'accompagnement"
                  : "Choisir votre organisme d'accompagnement"}
              </Button>
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );
};
