import {
  Autocomplete,
  AutocompleteOption,
} from "@/components/form/autocomplete/AutoComplete";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

const searchCertificationsQuery = graphql(`
  query searchCertificationsQuery($searchText: String!) {
    getCertifications(searchText: $searchText, status: AVAILABLE) {
      rows {
        id
        label
      }
    }
  }
`);

export const CertificateAutocomplete = ({
  onOptionSelection,
  onSubmit,
  defaultLabel,
}: {
  onOptionSelection?: (selectedOption: AutocompleteOption) => void;
  onSubmit?: (searchText: string) => void;
  defaultLabel?: string;
}) => {
  return (
    <Autocomplete
      defaultLabel={defaultLabel}
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
      onSubmit={onSubmit}
      placeholder="Recherchez un diplôme ..."
    />
  );
};
