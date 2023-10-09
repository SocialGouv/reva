import {
  Autocomplete,
  AutocompleteOption,
} from "@/components/form/autocomplete/AutoComplete";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

const searchCertificationsQuery = graphql(`
  query searchCertificationsQuery($searchText: String!) {
    getCertifications(searchText: $searchText) {
      rows {
        id
        label
      }
    }
  }
`);

export const CertificateAutocomplete = ({
  onOptionSelection,
}: {
  onOptionSelection?: (selectedOption: AutocompleteOption) => void;
}) => {
  return (
    <Autocomplete
      searchFunction={async (searchText) =>
        (
          await request(GRAPHQL_API_URL, searchCertificationsQuery, {
            searchText,
          })
        ).getCertifications.rows.map((r) => ({
          value: r.id,
          label: r.label,
        }))
      }
      onOptionSelection={onOptionSelection}
      placeholder="Rechercher un diplôme ..."
      emptyState={(searchCriteria) => (
        <p className="text-lg font-bold p-8">
          Les diplômes correspondants au métier "{searchCriteria}" ne sont pas
          disponibles.
        </p>
      )}
    />
  );
};
