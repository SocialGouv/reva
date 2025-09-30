"use client";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useParams } from "next/navigation";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import { useAppointmentsPage } from "./appointmentsPage.hook";

export default function AppointmentsPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { appointments } = useAppointmentsPage({ candidacyId });

  return (
    <div className="flex flex-col w-full" data-test="appointments-page">
      <h1>Gestion des rendez-vous</h1>
      <p className="text-xl mb-12">
        Renseignez tous les rendez-vous avec votre candidat. Commencez par
        renseigner le rendez-vous pédagogique obligatoire afin de pouvoir
        ajouter tous vos rendez-vous de suivi.
      </p>
      <ul className="pl-0 flex flex-col gap-4" data-test="appointments-list">
        {appointments?.rows?.map((appointment) => {
          let tagLabel = "";
          switch (appointment.type) {
            case "RENDEZ_VOUS_PEDAGOGIQUE":
              tagLabel = "Rendez-vous pédagogique";
              break;
            case "RENDEZ_VOUS_DE_SUIVI":
              tagLabel = "Rendez-vous de suivi";
              break;
          }

          let desc = formatIso8601Date(appointment.date);
          if (appointment.time) {
            desc += ` - ${formatIso8601Time(appointment.time)}`;
          }

          return (
            <li key={appointment.id} className="list-none">
              <Card
                enlargeLink
                size="small"
                start={<Tag small>{tagLabel}</Tag>}
                title={appointment.title}
                desc={desc}
                endDetail="Consulter et modifier les détails du rendez-vous."
                linkProps={{
                  href: `/candidacies/${candidacyId}/appointments/${appointment.id}`,
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
