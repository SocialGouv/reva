import Tile from "@codegouvfr/react-dsfr/Tile";

export const DateAndSubmissionTiles = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 lg:h-80 max-h-full">
      <Tile
        title="Renseigner une date prévisionnelle"
        desc="Cette date est une estimation et permet au certificateur d'anticiper l'organisation du passage devant le jury."
        // imageSvg
        imageUrl={"/candidat/images/pictograms/calendar.svg"}
        className="basis-1/2"
        linkProps={{ href: "./date-previsionnelle" }}
        // className="h-36"
      />
      <Tile
        title="Déposer un dossier de validation"
        desc="Un aménagement spécifique pour le passage devant le jury peut être demandé en même temps que le dépôt du dossier."
        imageUrl={"/candidat/images/pictograms/document-download.svg"}
        className="basis-1/2"
        linkProps={{ href: "./depot-dv" }}
      />
    </div>
  );
};
