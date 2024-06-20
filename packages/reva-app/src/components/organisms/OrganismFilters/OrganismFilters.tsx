import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useState } from "react";

import { OrganismDistanceFilter } from "./OrganismDistanceFilter";

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
  organismSearchZip?: string;
  organismSearchPmr: boolean;
}

export const OrganismFilters = ({
  onSearch,
  filterDistanceIsActive,
  filters,
}: {
  onSearch: (filters: filters) => void;
  filterDistanceIsActive: boolean;
  filters: filters;
}) => {
  const [zip, setZip] = useState("");
  const [pmr, setPmr] = useState(false);
  const { organismSearchRemote, organismSearchOnsite } = filters;
  const searchHasOnSiteSelected = organismSearchOnsite;

  return (
    <div className="mt-8 lg:mt-0 w-full flex flex-col">
      <h2>Filtres :</h2>
      <div className="px-4 py-4 mb-6 font-medium text-[#000091] bg-[#E3E3FD]">
        Modalités d'accompagnement
      </div>
      <div>
        <Button
          data-test="button-select-onsite"
          priority="tertiary no outline"
          title="Choisir sur site"
          onClick={() => {
            onSearch({
              ...filters,
              organismSearchOnsite: !organismSearchOnsite,
              organismSearchRemote: false,
            });
          }}
          className="p-2"
        >
          <Tag
            iconId="fr-icon-building-fill"
            className={tagFilledStyle(organismSearchOnsite)}
          >
            Sur site
          </Tag>
        </Button>
        <Button
          data-test="button-select-remote"
          priority="tertiary no outline"
          title="Choisir à distance"
          onClick={() => {
            onSearch({
              ...filters,
              organismSearchOnsite: false,
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
        {filterDistanceIsActive && (
          <OrganismDistanceFilter
            disabled={!searchHasOnSiteSelected}
            onChangeSearchZip={(zip) => {
              onSearch({
                ...filters,
                organismSearchZip: zip,
              });
            }}
            onChangeSearchPmr={(pmr) => {
              onSearch({
                ...filters,
                organismSearchPmr: pmr,
              });
            }}
            zip={zip}
            setZip={setZip}
            pmr={pmr}
            setPmr={setPmr}
          />
        )}
        <hr />
        <div className="flex justify-center">
          <Button
            priority="secondary"
            onClick={() => {
              onSearch({
                organismSearchRemote: false,
                organismSearchOnsite: false,
                organismSearchPmr: false,
                organismSearchZip: "",
                organismSearchText: "",
              });
              setZip("");
              setPmr(false);
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>
  );
};
