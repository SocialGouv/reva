import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { DossierDeValidationDecision, FeasibilityPdfDecision } from "interface";

export const DossierDeValidationTimelineElement = () => {
  const { state } = useMainMachineContext();

  const { dossierDeValidation, feasibilityPdf: feasibility } = state.context;

  const PENDING =
    dossierDeValidation?.decision === DossierDeValidationDecision.PENDING;
  const INCOMPLETE =
    dossierDeValidation?.decision === DossierDeValidationDecision.INCOMPLETE;

  let text = `Pensez à prévenir votre accompagnateur quand vous avez terminé la rédaction de votre dossier de validation.`;

  if (PENDING || INCOMPLETE) {
    text = `Votre dossier de validation a été transmis au certificateur.`;
  }

  const icon = !dossierDeValidation
    ? "fr-icon-time-fill"
    : "fr-icon-information-fill";

  const FEASIBILITY_ADMISSIBLE =
    feasibility?.decision === FeasibilityPdfDecision.ADMISSIBLE;

  return (
    <TimelineElement
      title="Dossier de validation"
      status={
        PENDING || INCOMPLETE
          ? "readonly"
          : FEASIBILITY_ADMISSIBLE
          ? "active"
          : "disabled"
      }
      description={
        FEASIBILITY_ADMISSIBLE ? (
          <p className="text-sm text-dsfrGray-500 mt-4 mb-0" role="status">
            Votre dossier de validation permettra au jury de valider le fait que
            vous avez bien les compétences pour obtenir votre diplôme.
          </p>
        ) : undefined
      }
    >
      {() =>
        FEASIBILITY_ADMISSIBLE && (
          <>
            <div className="flex text-dsfrGray-500">
              <span className={`fr-icon ${icon} mr-2 self-center`} />
              <p className="text-sm italic mb-0">{text}</p>
            </div>
          </>
        )
      }
    </TimelineElement>
  );
};
