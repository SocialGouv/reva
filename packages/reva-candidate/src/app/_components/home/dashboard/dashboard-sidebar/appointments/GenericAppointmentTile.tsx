import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import { AppointmentType } from "@/graphql/generated/graphql";

export const GenericAppointmentTile = ({
  date,
  type,
}: {
  date: string;
  type: AppointmentType;
}) => (
  <Tile
    data-test="rendez-vous-generique-tile"
    small
    orientation="horizontal"
    classes={{
      content: "pb-0",
    }}
    start={
      <Tag small>
        {type === "RENDEZ_VOUS_PEDAGOGIQUE"
          ? "Rendez-vous pédagogique"
          : "Rendez-vous de suivi"}
      </Tag>
    }
    title={`${formatIso8601Date(date)} - ${formatIso8601Time(date)}`}
  />
);
