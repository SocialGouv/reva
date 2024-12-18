import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import { useGetSelfServiceFeasibilityFileTimelineInfo } from "./useGetSelfServiceFeasibilityFileTimelineInfo";

export const SelfServiceFeasibilityFileTimelineElement = () => {
  const { status, badge, notice } =
    useGetSelfServiceFeasibilityFileTimelineInfo();

  const router = useRouter();

  return (
    <TimelineElement
      title="Dossier de faisabilité"
      description="Un document important pour résumer vos expériences et tenter d'obtenir votre recevabilité !"
      status={status}
      badge={badge}
      data-test="feasibility-timeline-element"
    >
      {notice}
      {status !== "readonly" ? (
        <Button
          data-test="feasibility-timeline-element-update-button"
          priority="primary"
          onClick={() => {
            router.push("/feasibility");
          }}
          disabled={status === "disabled"}
        >
          Compléter
        </Button>
      ) : (
        <Button
          data-test="feasibility-timeline-element-review-button"
          priority="secondary"
          onClick={() => {
            router.push("/feasibility");
          }}
        >
          Consulter
        </Button>
      )}
    </TimelineElement>
  );
};
