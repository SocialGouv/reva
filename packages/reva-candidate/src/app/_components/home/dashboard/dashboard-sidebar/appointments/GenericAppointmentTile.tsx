import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { addMinutes, format } from "date-fns";
import { useMemo, useRef } from "react";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import { AppointmentType } from "@/graphql/generated/graphql";

export const GenericAppointmentTile = ({
  date,
  type,
}: {
  date: string;
  type: AppointmentType;
}) => {
  const now = useRef(new Date()).current;
  const timezoneOffset = useRef(-now.getTimezoneOffset()).current;

  const timezoneName = useMemo(() => {
    const nowLocaleString = now.toLocaleDateString(undefined, {
      day: "2-digit",
      timeZoneName: "long",
    });
    return (
      nowLocaleString.substring(3).charAt(0).toUpperCase() +
      nowLocaleString.substring(3).slice(1)
    );
  }, [now]);

  const formatedOffset = useMemo(() => {
    const dateAtMidnight = now.setHours(0, 0, 0, 0);
    const dateWithAddedOffset = addMinutes(dateAtMidnight, timezoneOffset);
    return format(dateWithAddedOffset, "HH:mm");
  }, [now, timezoneOffset]);

  return (
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
      desc={`(GMT${timezoneOffset > 0 ? "+" : ""}${formatedOffset}) ${timezoneName}`}
    />
  );
};
