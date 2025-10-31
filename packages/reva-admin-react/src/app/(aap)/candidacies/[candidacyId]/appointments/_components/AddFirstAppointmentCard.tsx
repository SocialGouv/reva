import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const AddFirstAppointmentCard = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  return (
    <Card
      data-testid="add-first-appointment-card"
      enlargeLink
      size="small"
      start={<Tag small>Rendez-vous pédagogique</Tag>}
      title="Rendez-vous pédagogique"
      desc="Compléter le rendez-vous."
      linkProps={{
        href: `/candidacies/${candidacyId}/appointments/add-appointment?type=RENDEZ_VOUS_PEDAGOGIQUE`,
      }}
    />
  );
};
