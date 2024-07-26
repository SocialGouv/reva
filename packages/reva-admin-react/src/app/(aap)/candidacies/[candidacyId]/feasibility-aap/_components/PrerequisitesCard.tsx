import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { Prerequisite } from "@/graphql/generated/graphql";
import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { useParams } from "next/navigation";
import { useMemo } from "react";
export const PrerequisitesCard = ({
  prerequisites,
  prerequisitesPartComplete,
}: {
  prerequisites?: Prerequisite[] | null;
  prerequisitesPartComplete?: boolean | null;
}) => {
  const { candidacyId } = useParams();

  const prequisitesByStatus = useMemo(() => {
    return {
      acquired: prerequisites?.filter(
        (prerequisite) => prerequisite?.state === "ACQUIRED",
      ),
      inProgress: prerequisites?.filter(
        (prerequisite) => prerequisite?.state === "IN_PROGRESS",
      ),
      recommended: prerequisites?.filter(
        (prerequisite) => prerequisite?.state === "RECOMMENDED",
      ),
    };
  }, [prerequisites]);
  const noPrerequisites = !prerequisites?.length;

  return (
    <DefaultCandidacySectionCard
      title="Pré-requis obligatoires"
      titleIconClass="fr-icon-checkbox-circle-fill"
      status={prerequisitesPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      isEditable
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/prerequisites`}
    >
      {prerequisitesPartComplete &&
        (noPrerequisites ? (
          <p className="sm:ml-10">
            Il n'y a pas de prérequis obligatoires pour cette certification
          </p>
        ) : (
          <div className={`mt-1 ${fr.cx("fr-accordions-group")}`}>
            {!!prequisitesByStatus?.acquired?.length && (
              <Accordion label="Acquis">
                <ul>
                  {prequisitesByStatus?.acquired?.map((prerequisite) => (
                    <li key={prerequisite?.id}>{prerequisite?.label}</li>
                  ))}
                </ul>
              </Accordion>
            )}
            {!!prequisitesByStatus?.inProgress?.length && (
              <Accordion label="En cours">
                <ul>
                  {prequisitesByStatus?.inProgress?.map((prerequisite) => (
                    <li key={prerequisite?.id}>{prerequisite?.label}</li>
                  ))}
                </ul>
              </Accordion>
            )}
            {!!prequisitesByStatus?.recommended?.length && (
              <Accordion label="Préconisés">
                <ul>
                  {prequisitesByStatus?.recommended?.map((prerequisite) => (
                    <li key={prerequisite?.id}>{prerequisite?.label}</li>
                  ))}
                </ul>
              </Accordion>
            )}
          </div>
        ))}
    </DefaultCandidacySectionCard>
  );
};
