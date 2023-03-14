import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const OrganismTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();

  return (
    <TimelineElement
      title="Votre référent"
      description="Il vous guide tout au long du parcours"
      status={
        state.context.candidacyStatus === "PROJET"
          ? state.context.experiences.rest.length
            ? state.context.organism
              ? "editable"
              : "active"
            : "disabled"
          : "readonly"
      }
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
                {state.context.organism?.address && (
                  <p data-test="project-home-organism-address">
                    {state.context.organism?.address}
                  </p>
                )}
                {state.context.organism?.zip && state.context.organism?.city && (
                  <p data-test="project-home-organism-zip-city">
                    {state.context.organism?.zip} {state.context.organism?.city}
                  </p>
                )}
                {state.context.organism?.contactAdministrativeEmail && (
                  <p data-test="project-home-organism-email">
                    {state.context.organism?.contactAdministrativeEmail}
                  </p>
                )}
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
                  ? "Modifier votre référent"
                  : "Choisir votre référent"}
              </Button>
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );
};
