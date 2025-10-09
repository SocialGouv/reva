"use client";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useState } from "react";

import { formatIso8601Date } from "@/utils/formatIso8601Date";

import { useAppointments } from "./appointments.hooks";

export default function AppointmentsPage() {
  const { futureAppointments } = useAppointments({});

  return (
    <div className="flex flex-col gap-4 w-full">
      <Breadcrumb
        currentPageLabel="Mes prochains rendez-vous"
        className="mb-0"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "/",
            },
          },
        ]}
      />
      <div className="flex flex-col w-full gap-12">
        <h1 className="mb-0">Mes prochains rendez-vous</h1>
        <div className="flex flex-col gap-4">
          {futureAppointments?.map((appointment) => (
            <Card
              horizontal
              enlargeLink
              size="small"
              title={appointment.title}
              desc={
                formatIso8601Date(appointment.date) +
                (appointment.time ? ` - ${appointment.time}` : "")
              }
              detail={
                <Tag small>
                  {appointment.type === "RENDEZ_VOUS_PEDAGOGIQUE"
                    ? "Rendez-vous pédagogique"
                    : "Rendez-vous de suivi"}
                </Tag>
              }
              endDetail="Voir les détails"
              key={appointment.id}
              linkProps={{ href: `/appointments/${appointment.id}` }}
            />
          ))}
        </div>
      </div>
      <PastAppointments />
    </div>
  );
}

const PastAppointments = () => {
  const [pastLimit, setPastLimit] = useState(5);

  const { pastAppointments, totalPastAppointments } = useAppointments({
    pastLimit,
  });
  return (
    <>
      <Accordion
        label="Rendez-vous passés"
        className={`${pastAppointments.length > 0 ? "" : "hidden"}`}
      >
        <div className="flex flex-col gap-4">
          {pastAppointments?.map((appointment) => (
            <Card
              horizontal
              enlargeLink
              size="small"
              title={appointment.title}
              desc={
                formatIso8601Date(appointment.date) +
                (appointment.time ? ` - ${appointment.time}` : "")
              }
              detail={
                <Tag small>
                  {appointment.type === "RENDEZ_VOUS_PEDAGOGIQUE"
                    ? "Rendez-vous pédagogique"
                    : "Rendez-vous de suivi"}
                </Tag>
              }
              endDetail="Voir les détails"
              key={appointment.id}
              linkProps={{ href: `/appointments/${appointment.id}` }}
            />
          ))}
          {totalPastAppointments > pastLimit && (
            <Button
              className="self-end"
              priority="secondary"
              onClick={() => setPastLimit((pastLimit) => pastLimit + 5)}
            >
              Voir plus
            </Button>
          )}
        </div>
      </Accordion>
    </>
  );
};
