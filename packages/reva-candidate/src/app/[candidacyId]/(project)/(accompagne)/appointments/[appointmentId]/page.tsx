"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";

import { GenericAppointmentTile } from "@/app/_components/home/dashboard/dashboard-sidebar/appointments/GenericAppointmentTile";

import { useAppointmentDetail } from "./appointmentDetail.hooks";

const durationMap = {
  HALF_AN_HOUR: "30 minutes",
  ONE_HOUR: "1 heure",
  TWO_HOURS: "2 heures",
  THREE_HOURS: "3 heures",
  FOUR_HOURS: "4 heures",
};

const AppointmentDetailPage = () => {
  const { appointment, organism } = useAppointmentDetail();
  if (!appointment) return null;
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
            />
          </div>
          <div className="px-4">
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
              {appointment.duration && (
                <tr className="border-b">
                  <td className="w-1/3 py-4">Durée : </td>
                  <td
                    className="w-2/3 font-bold py-4"
                    data-test="appointment-duration"
                  >
                    {durationMap[appointment.duration]}
                  </td>
                </tr>
              )}
              {appointment.location && (
                <tr className="border-b ">
                  <td className="w-1/3 py-4">Lieu : </td>
                  <td
                    className="w-2/3 font-bold py-4"
                    data-test="appointment-location"
                  >
                    {appointment.location}
                  </td>
                </tr>
              )}
              {appointment.description && (
                <tr className="border-b ">
                  <td className="w-1/3 py-4">Description : </td>
                  <td
                    className="w-2/3 font-bold py-4"
                    data-test="appointment-description"
                  >
                    {appointment.description}
                  </td>
                </tr>
              )}
            </table>
          </div>
        </div>
        <Button linkProps={{ href: "../" }} priority="secondary">
          Retour
        </Button>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
