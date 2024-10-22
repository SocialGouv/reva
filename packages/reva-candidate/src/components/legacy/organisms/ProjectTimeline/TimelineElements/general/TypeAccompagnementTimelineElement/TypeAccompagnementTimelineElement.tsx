import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

export const TypeAccompagnementTimelineElement = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  let status: TimeLineElementStatus = "disabled";

  if (candidacy.certification) {
    status = "editable";
  }

  if (candidacy.status !== "PROJET") {
    status = "readonly";
  }

  return (
    <TimelineElement
      title="Modalités de parcours"
      description="VAE accompagnée ou en autonomie ? Vous pouvez changer d’avis jusqu’à l’envoi du dossier de faisabilité."
      status={status}
      data-test="type-accompagnement-timeline-element"
    >
      <h4
        data-test="type-accompagnement-timeline-element-label"
        className="mb-4 text-base font-normal"
      >
        {candidacy.typeAccompagnement === "ACCOMPAGNE" && "VAE accompagnée"}
        {candidacy.typeAccompagnement === "AUTONOME" && "VAE en autonomie"}
      </h4>
      {status !== "readonly" && (
        <Button
          data-test="type-accompagnement-timeline-element-update-button"
          priority="secondary"
          onClick={() => {
            router.push("/type-accompagnement");
          }}
          disabled={status === "disabled"}
        >
          Modifier
        </Button>
      )}
    </TimelineElement>
  );
};
