import Badge from "@codegouvfr/react-dsfr/Badge";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { format } from "date-fns";

import { DffEligibilityRequirement } from "@/graphql/generated/graphql";

const EligibiltyBadge = ({
  eligibilityRequirement,
}: {
  eligibilityRequirement: DffEligibilityRequirement | null;
}) => {
  if (eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT") {
    return (
      <Badge severity="info" className="hide-bg-for-pdf">
        Accès au dossier de faisabilité intégral
      </Badge>
    );
  }
  if (eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT") {
    return (
      <Badge severity="new" className="hide-bg-for-pdf">
        Accès au dossier de faisabilité adapté
      </Badge>
    );
  }
  return null;
};

export default function EligibilitySection({
  eligibilityRequirement,
  eligibilityValidUntil,
}: {
  eligibilityRequirement: DffEligibilityRequirement | null;
  eligibilityValidUntil: Date | null;
}) {
  return (
    <div className="mb-8">
      <div className="flex">
        <span
          className="ri-folder-check-fill fr-icon--lg mr-2"
          data-html2canvas-ignore="true"
        />
        <h2>Recevabilité du candidat</h2>
      </div>
      <EligibiltyBadge eligibilityRequirement={eligibilityRequirement} />
      {eligibilityValidUntil && (
        <>
          <p className="mb-0 mt-4">Date de fin de validité</p>
          <p className="font-medium mb-4">
            {format(eligibilityValidUntil, "dd/MM/yyyy")}
          </p>
          <CallOut className="mb-0">
            Le candidat s&apos;engage à respecter le délai de fin de validité de
            la recevabilité
          </CallOut>
        </>
      )}
    </div>
  );
}
