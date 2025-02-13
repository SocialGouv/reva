import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { OrganismDistanceFilter } from "./OrganismDistanceFilter";

const tagFilledStyle = (isSelected: boolean) =>
  isSelected
    ? "bg-dsfrBlue-500 text-white"
    : "bg-dsfrBlue-300 text-dsfrBlue-500";

const modalDistanceInfo = createModal({
  id: "distance-organism-info",
  isOpenedByDefault: false,
});

const modalMcfInfo = createModal({
  id: "mcf-organism-info",
  isOpenedByDefault: false,
});

interface filters {
  organismSearchText: string;
  organismSearchRemote: boolean;
  organismSearchOnsite: boolean;
  organismSearchZip: string;
  organismSearchPmr: boolean;
  organismSearchMcf: boolean;
}

export const OrganismFilters = ({
  onSearch,
  filters,
}: {
  onSearch: (filters: filters) => void;
  filters: filters;
}) => {
  const { organismSearchRemote, organismSearchOnsite } = filters;

  return (
    <div className="mt-8 lg:mt-0 w-full flex flex-col">
      <h2>Filtres :</h2>
      <div className="mb-4">
        <Accordion
          label="Modalités d’accompagnement"
          defaultExpanded
          className=""
        >
          <div className="-mb-6">
            <Button
              data-test="button-select-onsite"
              aria-pressed={organismSearchOnsite}
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
              aria-pressed={organismSearchRemote}
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
            <OrganismDistanceFilter
              disabled={!organismSearchOnsite}
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
              filters={filters}
            />
          </div>
        </Accordion>
        <Accordion label="Référencement MCF" defaultExpanded>
          <div className="-mb-6">
            <Button
              data-test="button-open-modal-mcf"
              priority="tertiary no outline"
              title="Quelle option à distance choisir ?"
              iconId="fr-icon-information-fill"
              onClick={() => modalMcfInfo.open()}
              className="mb-4"
            >
              <span className="text-dsfrBlue-500 text-sm font-bold">
                Qu’est ce que MCF ?
              </span>
            </Button>
            <modalMcfInfo.Component
              title="Qu’est ce que MCF ?"
              size="medium"
              iconId="fr-icon-information-fill"
              className="[&_h1>span]:mr-2" // add space bewteen icon and title
            >
              <p className="my-4">
                Mon Compte Formation (MCF) est un service public français
                permettant de financer des formations professionnelles.
              </p>
            </modalMcfInfo.Component>
            <Checkbox
              data-test="checkbox-wrapper-mcf"
              small
              options={[
                {
                  label:
                    "Afficher les accompagnateurs référencés sur Mon Compte Formation (MCF)",
                  nativeInputProps: {
                    checked: filters.organismSearchMcf,
                    onChange: (e) => {
                      console.log("onChange", e.target.checked);
                      onSearch({
                        ...filters,
                        organismSearchMcf: e.target.checked,
                      });
                    },
                  },
                },
              ]}
            />
          </div>
        </Accordion>
      </div>

      <div className="flex justify-center">
        <Button
          data-test="sidebar-button-reset-filters"
          priority="tertiary no outline"
          onClick={() => {
            onSearch({
              organismSearchRemote: false,
              organismSearchOnsite: false,
              organismSearchPmr: false,
              organismSearchZip: "",
              organismSearchText: "",
              organismSearchMcf: false,
            });
          }}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
};
