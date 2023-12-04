import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useProjectTimeline } from "components/organisms/ProjectTimeline/ProjectTimeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const OrganismTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  const { getTimelineElementStatus } = useProjectTimeline();

  const organism = state.context.organism;
  const informationsCommerciales = organism?.informationsCommerciales;

  const organismDisplayInfo = {
    label: informationsCommerciales?.nom || organism?.label,
    email:
      informationsCommerciales?.emailContact ||
      organism?.contactAdministrativeEmail,
    phone:
      informationsCommerciales?.telephone ||
      organism?.contactAdministrativePhone,
  };

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
          {organismDisplayInfo && (
            <div className="flex flex-col p-4 border border-dsfrBlue-500">
              {state.context.organism?.label && (
                <h3
                  data-test="project-home-organism-label"
                  className="text-base font-medium"
                >
                  {organismDisplayInfo?.label}
                </h3>
              )}
              <address className="not-italic">
                <p>
                  <span data-test="project-home-organism-email">
                    {organismDisplayInfo.email}
                  </span>
                  {organismDisplayInfo.phone && (
                    <>
                      &nbsp; - &nbsp;
                      <span data-test="project-home-organism-phone">
                        {organismDisplayInfo.phone}
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
