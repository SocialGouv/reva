import { useCandidacy } from "@/components/candidacy/candidacy.context";
import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

export const DossierDeValidationAutonomeTimelineElement = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  let status: TimeLineElementStatus = "disabled";

  const activeStatuses = ["DOSSIER_FAISABILITE_RECEVABLE"];

  if (activeStatuses.includes(candidacy.status)) {
    status = "active";
  }

  return (
    <TimelineElement
      title="Dossier de validation"
      status={status}
      data-test="dossier-de-validation-autonome-timeline-element"
      description="Ce dossier permet de justifier de vos expériences et compétences lors de votre passage devant le jury."
    >
      <Button
        data-test="dossier-de-validation-autonome-timeline-element-update-button"
        priority={status === "active" ? "primary" : "secondary"}
        disabled={status === "disabled"}
        onClick={() => {
          router.push("/dossier-de-validation-autonome");
        }}
      >
        Compléter
      </Button>
    </TimelineElement>
  );
};
