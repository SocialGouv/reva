import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";

export const DateAndSubmissionTiles = ({
  readyForJuryEstimatedAt,
}: {
  readyForJuryEstimatedAt?: string | null;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 lg:h-80 max-h-full">
      <Tile
        start={
          readyForJuryEstimatedAt ? (
            <Tag>{readyForJuryEstimatedAt}</Tag>
          ) : undefined
        }
        title={
          readyForJuryEstimatedAt
            ? "Date prévisionnelle"
            : "Renseigner une date prévisionnelle"
        }
        desc={
          readyForJuryEstimatedAt
            ? undefined
            : "Cette date est une estimation et permet au certificateur d'anticiper l'organisation du passage devant le jury."
        }
        detail={readyForJuryEstimatedAt ? "Modifier" : undefined}
        imageUrl={"/candidat/images/pictograms/calendar.svg"}
        className="basis-1/2"
        linkProps={{ href: "./date-previsionnelle" }}
        classes={{
          img: "mb-0",
          detail: "mt-0",
        }}
      />
      <Tile
        title="Déposer un dossier de validation"
        desc="Un aménagement spécifique pour le passage devant le jury peut être demandé en même temps que le dépôt du dossier."
        imageUrl={"/candidat/images/pictograms/document-download.svg"}
        className="basis-1/2"
        linkProps={{ href: "./depot-dv" }}
        classes={{
          img: "mb-0",
        }}
      />
    </div>
  );
};
