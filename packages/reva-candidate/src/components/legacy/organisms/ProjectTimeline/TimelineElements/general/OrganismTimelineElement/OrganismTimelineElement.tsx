import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const OrganismTimelineElement = () => {
  const router = useRouter();

  const { canEditCandidacy, candidacy } = useCandidacy();

  const { experiences, organism } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!canEditCandidacy) {
    status = "readonly";
  } else if (experiences.length == 0) {
    status = "disabled";
  } else if (organism) {
    status = "editable";
  }

  const organismDisplayInfo = organism
    ? {
        label: organism.nomPublic || organism.label,
        email: organism.emailContact || organism.contactAdministrativeEmail,
        phone: organism.telephone || organism?.contactAdministrativePhone,
      }
    : undefined;

  return (
    <TimelineElement
      title="Votre organisme d'accompagnement"
      description="Il vous guide tout au long du parcours"
      status={status}
    >
      <>
        {organismDisplayInfo && (
          <div className="flex flex-col p-4 border border-dsfrBlue-500">
            {organism?.label && (
              <h3
                data-test="project-home-organism-label"
                className="text-base font-medium mb-0"
              >
                {organismDisplayInfo?.label}
              </h3>
            )}
            <address className="not-italic text-base">
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
            </address>
          </div>
        )}
        <div className="mt-4 text-sm text-slate-400">
          {status !== "readonly" && (
            <Button
              data-test="project-home-edit-organism"
              priority="secondary"
              disabled={status === "disabled"}
              onClick={() => {
                router.push("/set-organism");
              }}
            >
              {organism ? "Modifier" : "Choisir"}
            </Button>
          )}
        </div>
      </>
    </TimelineElement>
  );
};
