import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import { AppointmentType } from "@/graphql/generated/graphql";

export const AppointmentCard = ({
  appointment,
  candidacyId,
  disabled,
}: {
  appointment: {
    id: string;
    type: AppointmentType;
    date: string;
    title: string;
  };
  candidacyId: string;
  disabled?: boolean;
}) => {
  let tagLabel = "";
  switch (appointment.type) {
    case "RENDEZ_VOUS_PEDAGOGIQUE":
      tagLabel = "Rendez-vous pédagogique";
      break;
    case "RENDEZ_VOUS_DE_SUIVI":
      tagLabel = "Rendez-vous de suivi";
      break;
  }

  const desc = `${formatIso8601Date(appointment.date)} - ${formatIso8601Time(appointment.date)}`;

  const linkProps = disabled
    ? ({ enlargeLink: false } as const)
    : ({
        linkProps: {
          href: `/candidacies/${candidacyId}/appointments/${appointment.id}`,
        },
        enlargeLink: true,
      } as const);

  return (
    <Card
      size="small"
      start={<Tag small>{tagLabel}</Tag>}
      title={appointment.title}
      desc={desc}
      endDetail="Consulter et modifier les détails du rendez-vous."
      {...linkProps}
    />
  );
};
