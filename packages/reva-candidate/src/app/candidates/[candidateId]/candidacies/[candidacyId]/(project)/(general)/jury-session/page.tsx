"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { BackButton } from "@/components/back-button/BackButton";
import {
  createGoogleCalendarLinkForJury,
  createIcsFileForJury,
  createOutlookCalendarLinkForJury,
} from "@/utils/calendarLinks";
import { handleAuthenticatedDownload } from "@/utils/handleAuthenticatedDownload.util";

import { JuryUseJurySession, useJurySession } from "./jury-session.hook";

const addToCalendarModal = createModal({
  id: "add-jury-to-calendar-modal",
  isOpenedByDefault: false,
});

const JuryInformation = ({
  jury,
}: {
  jury: NonNullable<JuryUseJurySession>;
}) => (
  <div className="mt-4 px-4 flex flex-col gap-4">
    <table className="w-full">
      <tr className="border-b">
        <td className="w-1/3 py-4">Programmé par :</td>
        <td
          className="w-2/3 font-bold py-4"
          data-testid="appointment-organized-by"
        >
          {jury.candidacy?.feasibility?.certificationAuthority?.label}
        </td>
      </tr>
      <tr className="border-b ">
        <td className="w-1/3 py-4">Lieu : </td>
        <td className="w-2/3 font-bold py-4" data-testid="appointment-location">
          {jury.addressOfSession ||
            "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous."}
        </td>
      </tr>
      <tr className="border-b ">
        <td className="w-1/3 py-4">Description : </td>
        <td
          className="w-2/3 font-bold py-4"
          data-testid="appointment-description"
        >
          {jury.informationOfSession ||
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
);

export default function JurySessionPage() {
  const { jury } = useJurySession();
  const { accessToken } = useKeycloakContext();
  const router = useRouter();
  const icsDownloaHiddenLink = useRef<HTMLAnchorElement>(null);

  if (!jury) {
    return null;
  }

  const dateOfJurySession = jury.timeSpecified
    ? format(jury.dateOfSession, "dd/MM/yyyy - HH:mm")
    : format(jury.dateOfSession, "dd/MM/yyyy");

  const onDownloadClick = (e: React.SyntheticEvent) => {
    if (!jury.convocationFile?.url || !accessToken) {
      return;
    }
    handleAuthenticatedDownload(jury.convocationFile.url, accessToken, e);
  };

  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel="Passage devant le jury"
        className="mb-4"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />
      <h1 className="mb-6">Passage devant le jury</h1>
      <p className="text-lg mb-12 text-dsfrGray-700">
        Une date de jury vous a été attribuée. Retrouvez toutes les informations
        officielles dans votre convocation.
      </p>
      <div className="flex">
        <Tile
          small
          orientation="horizontal"
          classes={{
            content: "pr-20 pb-0",
          }}
          start={<Tag small>Passage devant le jury</Tag>}
          title={dateOfJurySession}
        />
      </div>

      <JuryInformation jury={jury} />

      {jury.convocationFile && (
        <Tile
          buttonProps={{ onClick: onDownloadClick }}
          downloadButton
          enlargeLinkOrButton
          orientation="horizontal"
          title="Convocation au passage devant le jury"
          titleAs="h3"
          detail="PDF"
          className="!border-b-0 mb-0"
        />
      )}
      <addToCalendarModal.Component title="Ajouter à mon agenda">
        <p>Ajoutez vos rendez-vous à votre agenda pour ne pas les oublier.</p>
        <div className="flex flex-row gap-4 justify-center">
          <Button
            priority="tertiary"
            linkProps={{ href: createGoogleCalendarLinkForJury(jury) }}
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
            download={`jury${jury.dateOfSession}.ics`}
            className="hidden"
          ></a>
          <Button
            priority="tertiary"
            className="after:hidden p-3"
            title="Ajouter à l'agenda de votre appareil"
            onClick={() => {
              const icsFile = createIcsFileForJury(jury);
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
            linkProps={{ href: createOutlookCalendarLinkForJury(jury) }}
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

      <BackButton navigateBack={() => router.push("../")} className="mt-12" />
    </div>
  );
}
