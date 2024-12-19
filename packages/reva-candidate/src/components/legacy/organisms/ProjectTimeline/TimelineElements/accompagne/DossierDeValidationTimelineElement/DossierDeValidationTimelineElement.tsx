import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useGetDossierDeValidationTimelineInfo } from "./useGetDossierDeValidationTimelineInfo";

export const DossierDeValidationTimelineElement = () => {
  const { candidacy } = useCandidacy();

  const { feasibility } = candidacy;
  const { status, icon, text } = useGetDossierDeValidationTimelineInfo();

  const FEASIBILITY_ADMISSIBLE = feasibility?.decision === "ADMISSIBLE";

  return (
    <TimelineElement
      title="Dossier de validation"
      status={status}
      description={
        FEASIBILITY_ADMISSIBLE ? (
          <p className="text-sm text-dsfrGray-500 mt-4 mb-0" role="status">
            Votre dossier de validation permettra au jury de prendre
            connaissances de vos activités et de votre parcours afin de prendre
            une première mesure de vos compétences acquises et de préparer votre
            entretien.
          </p>
        ) : undefined
      }
    >
      {FEASIBILITY_ADMISSIBLE && (
        <>
          <div className="flex text-dsfrGray-500">
            <span className={`fr-icon ${icon} mr-2 self-center`} />
            <p className="text-sm italic mb-0">{text}</p>
          </div>
        </>
      )}
    </TimelineElement>
  );
};
