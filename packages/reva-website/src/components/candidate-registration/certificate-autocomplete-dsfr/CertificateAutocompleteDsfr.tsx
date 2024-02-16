import {
  AutocompleteDsfr,
  AutocompleteOption,
} from "@/components/form/autocomplete-dsfr/AutoCompleteDsfr";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

const searchCertificationsQuery = graphql(`
  query searchCertificationsQuery($searchText: String!) {
    searchCertificationsForCandidate(
      searchText: $searchText
      status: AVAILABLE
    ) {
      rows {
        id
        label
      }
    }
  }
`);

export const CertificateAutocompleteDsfr = ({
  onOptionSelection,
  onSubmit,
  defaultLabel,
}: {
  onOptionSelection: (selectedOption: AutocompleteOption) => void;
  onSubmit?: (selectedOption: AutocompleteOption) => void;
  defaultLabel?: string;
}) => {
  return (
    <AutocompleteDsfr
      defaultLabel={defaultLabel}
      searchFunction={async (searchText) =>
        (
          await request(GRAPHQL_API_URL, searchCertificationsQuery, {
            searchText,
          })
        ).searchCertificationsForCandidate.rows.map((r) => ({
          value: r.id,
          label: r.label,
        }))
      }
      onOptionSelection={onOptionSelection}
      onSubmit={onSubmit}
      placeholder="Ex : bac, cap, master, titre professionnel..."
    />
  );
};
