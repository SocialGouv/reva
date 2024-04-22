import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

const tagFilledStyle = (isSelected: boolean) =>
  isSelected
    ? "bg-dsfrBlue-500 text-white"
    : "bg-dsfrBlue-300 text-dsfrBlue-500";

const modalDistanceInfo = createModal({
  id: "distance-organism-info",
  isOpenedByDefault: false,
});

interface filters {
  organismSearchText: string;
  organismSearchRemote: boolean;
  organismSearchOnsite: boolean;
}

export const OrganismFilters = ({
  onSearch,
  filters: { organismSearchText, organismSearchRemote, organismSearchOnsite },
}: {
  onSearch: (filters: filters) => void;
  filters: filters;
}) => {
  return (
    <div className="mt-8 w-full">
      <h2 className="text-3xl font-semibold mb-4">Filtres :</h2>
      <h3 className="px-4 py-2 mb-6 font-medium text-[#000091] bg-[#E3E3FD]">
        Modalités d'accompagnement
      </h3>
      <div>
        <Button
          data-test="button-select-onsite"
          priority="tertiary no outline"
          title="Choisir sur site"
          onClick={() => {
            onSearch({
              organismSearchText,
              organismSearchOnsite: !organismSearchOnsite,
              organismSearchRemote: organismSearchRemote,
            });
          }}
          className="p-2"
        >
          <Tag
            iconId="fr-icon-building-fill"
            className={tagFilledStyle(organismSearchOnsite)}
          >
            Sur place
          </Tag>
        </Button>
        <Button
          data-test="button-select-remote"
          priority="tertiary no outline"
          title="Choisir à distance"
          onClick={() => {
            onSearch({
              organismSearchText,
              organismSearchOnsite,
              organismSearchRemote: !organismSearchRemote,
            });
          }}
          className="p-2"
        >
          <Tag
            iconId="fr-icon-customer-service-fill"
            className={tagFilledStyle(organismSearchRemote)}
          >
            À distance
          </Tag>
        </Button>
        <Button
          data-test="button-open-modal-distance"
          priority="tertiary no outline"
          title="Quelle option à distance choisir ?"
          iconId="fr-icon-information-fill"
          onClick={() => modalDistanceInfo.open()}
        >
          <span className="text-dsfrBlue-500 text-sm font-bold">
            Quelle option choisir ?
          </span>
        </Button>
        <modalDistanceInfo.Component
          title="Comment bien choisir entre “sur site” et “à distance” ?"
          size="large"
        >
          <p className="my-4">
            Les accompagnements <strong>sur site </strong>
            sont réalisés directement dans les locaux de l’organisme
            sélectionné.
          </p>
          <p>
            Les accompagnements <strong>à distance</strong> se déroulent
            essentiellement par téléphone ou sur internet, via des outils de
            visio-conférence.
          </p>
        </modalDistanceInfo.Component>
      </div>
    </div>
  );
};
