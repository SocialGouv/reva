"use client";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { BackButton } from "@/components/back-button/BackButton";
import { handleAuthenticatedDownload } from "@/utils/handleAuthenticatedDownload.util";

import { JuryUseJurySession, useJurySession } from "./jury-session.hook";

const JuryInformation = ({
  jury,
}: {
  jury: NonNullable<JuryUseJurySession>;
}) => (
  <>
    {(jury.addressOfSession || jury.informationOfSession) && (
      <div className="flex my-6 gap-6">
        {jury.addressOfSession && (
          <div className="flex-1">
            <p className="mb-0">Lieu :</p>
            <p className="mb-0 font-bold">{jury.addressOfSession}</p>
          </div>
        )}
        {jury.informationOfSession && (
          <div className="flex-1">
            <p className="mb-0">Informations complémentaires :</p>
            <p className="mb-0 font-bold">{jury.informationOfSession}</p>
          </div>
        )}
      </div>
    )}
  </>
);

export default function JurySessionPage() {
  const { jury } = useJurySession();
  const { accessToken } = useKeycloakContext();
  const router = useRouter();

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
          start={
            <Badge severity="info" small noIcon>
              Passage devant le jury
            </Badge>
          }
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

      <BackButton navigateBack={() => router.push("../")} className="mt-12" />
    </div>
  );
}
