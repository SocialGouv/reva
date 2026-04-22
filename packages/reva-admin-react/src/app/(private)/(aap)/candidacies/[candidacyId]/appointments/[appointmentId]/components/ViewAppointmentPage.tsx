import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import {
  AppointmentType,
  AppointmentDuration,
} from "@/graphql/generated/graphql";

const getAppointmentDurationLabel = (duration?: AppointmentDuration | null) => {
  if (!duration) {
    return "Non renseigné";
  }

  switch (duration) {
    case "HALF_AN_HOUR":
      return "30 minutes";
    case "ONE_HOUR":
      return "1 heure";
    case "TWO_HOURS":
      return "2 heures";
    case "THREE_HOURS":
      return "3 heures";
    case "FOUR_HOURS":
      return "4 heures";
  }
};

export const ViewAppointmentPage = ({
  appointment,
  candidate,
  candidacyId,
}: {
  appointment: {
    id: string;
    type: AppointmentType;
    title: string;
    date: string;
    description?: string | null;
    duration?: AppointmentDuration | null;
    location?: string | null;
  };
  candidate: {
    id: string;
    lastname: string;
    firstname: string;
  };
  candidacyId: string;
}) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzOffset = new Date().getTimezoneOffset() / 60;

  const timeZoneInfo = `(GMT${tzOffset <= 0 ? "+" : "-"}${Math.abs(tzOffset)}) ${tz}`;

  return (
    <div className="flex flex-col w-full" data-testid="view-appointments-page">
      <h1>{appointment.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
        <div className="mb-8 mr-4">
          <Tile
            data-testid="rendez-vous-pedagogique-tile"
            start={
              <Tag small>
                {appointment.type === "RENDEZ_VOUS_PEDAGOGIQUE"
                  ? "Rendez-vous pédagogique"
                  : "Rendez-vous de suivi"}
              </Tag>
            }
            classes={{
              content: "pb-0",
            }}
            disabled
            small
            orientation="horizontal"
            title={`${formatIso8601Date(appointment.date)} - ${formatIso8601Time(appointment.date)}`}
            desc={timeZoneInfo}
          />
        </div>
        <GridRow
          data-testid="candidate-row"
          label="Candidat :"
          value={`${candidate.lastname} ${candidate.firstname}`}
        />
        <GridRow
          data-testid="duration-row"
          label="Durée estimée :"
          value={getAppointmentDurationLabel(appointment.duration)}
        />
        <GridRow
          data-testid="location-row"
          label="Lieu :"
          value={appointment.location || "Non renseigné"}
        />
        <GridRow
          data-testid="description-row"
          label="Description :"
          value={appointment.description || "Non renseigné"}
        />
      </div>
      <Button
        data-testid="back-button"
        priority="secondary"
        className="mt-12"
        linkProps={{ href: `/candidacies/${candidacyId}/appointments` }}
      >
        Retour
      </Button>
    </div>
  );
};

const GridRow = ({
  label,
  value,
  "data-testid": dataTest,
}: {
  label: string;
  value?: string | null;
  "data-testid"?: string;
}) => {
  return (
    <>
      <div className="col-start-1">{label}</div>
      <div data-testid={dataTest || ""} className="break-all">
        <strong>{value}</strong>
      </div>
      <hr className="col-span-full mt-4 pb-4" />
    </>
  );
};
