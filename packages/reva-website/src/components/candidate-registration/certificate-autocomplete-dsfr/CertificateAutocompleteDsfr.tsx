import request from "graphql-request";

import {
  AutocompleteDsfr,
  AutocompleteOption,
} from "@/components/form/autocomplete-dsfr/AutoCompleteDsfr";
import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

const searchCertificationsQuery = graphql(`
  query searchCertificationsQuery($searchText: String!) {
    searchCertificationsForCandidate(searchText: $searchText, limit: 5) {
      rows {
        id
        label
        codeRncp
      }
    }
  }
`);

export const CertificateAutocompleteDsfr = ({
  onOptionSelection,
  onSubmit,
  defaultLabel,
  big,
  defaultValue,
}: {
  onOptionSelection: (selectedOption: AutocompleteOption) => void;
  onSubmit?: (selectedOption: AutocompleteOption) => void;
  defaultLabel?: string;
  big?: boolean;
  defaultValue?: string;
}) => {
  return (
    <AutocompleteDsfr
      defaultLabel={defaultLabel}
      big={big}
      defaultValue={defaultValue}
      searchFunction={async (searchText) =>
        (
          await request(GRAPHQL_API_URL, searchCertificationsQuery, {
            searchText,
          })
        ).searchCertificationsForCandidate.rows.map((r) => ({
          value: r.id,
          label: r.label,
          codeRncp: r.codeRncp,
        }))
      }
      emptyLabel="Aucune certification ou diplôme trouvés. Vérifiez l'orthographe et relancez votre recherche"
      onOptionSelection={onOptionSelection}
      onSubmit={onSubmit}
      placeholder="Ex : bac, cap, master, titre professionnel, code RNCP..."
    />
  );
};
