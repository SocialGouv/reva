"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Image from "next/image";
import { useRef } from "react";

import { GenericAppointmentTile } from "@/app/_components/home/dashboard/dashboard-sidebar/appointments/GenericAppointmentTile";
import {
  createGoogleCalendarLink,
  createIcsFile,
  createOutlookCalendarLink,
} from "@/utils/calendarLinks";

import { useAppointmentDetail } from "./appointmentDetail.hooks";

const durationToPlainText = {
  HALF_AN_HOUR: "30 minutes",
  ONE_HOUR: "1 heure",
  TWO_HOURS: "2 heures",
  THREE_HOURS: "3 heures",
  FOUR_HOURS: "4 heures",
} as const;

const addToCalendarModal = createModal({
  id: "add-to-calendar-modal",
  isOpenedByDefault: false,
});

const AppointmentDetailPage = () => {
  const { appointment, organism } = useAppointmentDetail();
  const icsDownloaHiddenLink = useRef<HTMLAnchorElement>(null);

  if (!appointment) return null;
  console.log(createGoogleCalendarLink(appointment));
  console.log(createOutlookCalendarLink(appointment));
  return (
    <div className="flex flex-col gap-4 w-full">
      <Breadcrumb
        currentPageLabel={appointment.title}
        className="mb-0"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: "Mes prochains rendez-vous",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />
      <div className="flex flex-col w-full gap-12">
        <h1 className="mb-0">{appointment.title}</h1>
        <div className="flex flex-col gap-6">
          <div className="flex max-w-96">
            <GenericAppointmentTile
              date={appointment.date}
              type={appointment.type}
              showTimezone
            />
          </div>
          <div className="px-4 flex flex-col gap-4">
            <table className="w-full">
              <tr className="border-b">
                <td className="w-1/3 py-4">Programmé par :</td>
                <td
                  className="w-2/3 font-bold py-4"
                  data-test="appointment-organized-by"
                >
                  {organism?.nomPublic || organism?.label}
                </td>
              </tr>
              <tr className="border-b">
                <td className="w-1/3 py-4">Durée : </td>
                <td
                  className="w-2/3 font-bold py-4"
                  data-test="appointment-duration"
                >
                  {appointment.duration
                    ? durationToPlainText[appointment.duration]
                    : "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous."}
                </td>
              </tr>
              <tr className="border-b ">
                <td className="w-1/3 py-4">Lieu : </td>
                <td
                  className="w-2/3 font-bold py-4"
                  data-test="appointment-location"
                >
                  {appointment.location ||
                    "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous."}
                </td>
              </tr>
              <tr className="border-b ">
                <td className="w-1/3 py-4">Description : </td>
                <td
                  className="w-2/3 font-bold py-4"
                  data-test="appointment-description"
                >
                  {appointment.description ||
                    "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous."}
                </td>
              </tr>
            </table>
            <Button
              priority="tertiary no outline"
              className="self-end"
              onClick={() => addToCalendarModal.open()}
              iconId="ri-calendar-check-line"
            >
              Ajouter à mon agenda
            </Button>
          </div>
        </div>
        <Button linkProps={{ href: "../" }} priority="secondary">
          Retour
        </Button>
      </div>
      <addToCalendarModal.Component title="Ajouter à mon agenda">
        <p>Ajoutez vos rendez-vous à votre agenda pour ne pas les oublier.</p>
        <div className="flex flex-row gap-4 justify-center">
          <Button
            priority="tertiary"
            linkProps={{ href: createGoogleCalendarLink(appointment) }}
            className="after:hidden p-3"
            title="Ajouter à Google Calendar"
          >
            <Image
              src="/candidat/images/icons/googlecalendar.svg"
              alt="Google Calendar"
              width={32}
              height={32}
            />
          </Button>
          <a
            ref={icsDownloaHiddenLink}
            href="#"
            download={`${appointment.title}.ics`}
            className="hidden"
          ></a>
          <Button
            priority="tertiary"
            className="after:hidden p-3"
            title="Ajouter à l'agenda de votre appareil"
            onClick={() => {
              const icsFile = createIcsFile(appointment);
              const blob = new Blob([icsFile], { type: "text/calendar" });
              const url = URL.createObjectURL(blob);
              icsDownloaHiddenLink.current!.href = url;
              icsDownloaHiddenLink.current!.click();
              setTimeout(() => {
                icsDownloaHiddenLink.current!.href = "";
                window.URL.revokeObjectURL(url);
              }, 100);
            }}
          >
            <Image
              src="/candidat/images/icons/applecalendar.svg"
              alt="Apple Calendar"
              width={32}
              height={32}
            />
          </Button>
          <Button
            priority="tertiary"
            linkProps={{ href: createOutlookCalendarLink(appointment) }}
            className="after:hidden p-3"
            title="Ajouter à Outlook"
          >
            <Image
              src="/candidat/images/icons/outlook.svg"
              alt="Outlook"
              width={32}
              height={32}
            />
          </Button>
        </div>
      </addToCalendarModal.Component>
    </div>
  );
};

export default AppointmentDetailPage;
