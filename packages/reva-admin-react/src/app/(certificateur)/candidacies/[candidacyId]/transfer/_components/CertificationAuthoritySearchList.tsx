import { SearchList } from "@/components/search/search-list/SearchList";
import {
  CertificationAuthority,
  CertificationAuthorityPaginated,
} from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { CertificationAuthorityCard } from "./CertificationAuthorityCard";

export const CertificationAuthoritySearchList = ({
  certificationAuthorities,
  searchFilter,
  setCertificationAuthoritySelected,
}: {
  certificationAuthorities: CertificationAuthorityPaginated;
  searchFilter: string;
  setCertificationAuthoritySelected: (
    certificationAuthority: CertificationAuthority,
  ) => void;
}) => {
  return (
    <SearchList
      searchResultsPage={
        certificationAuthorities as CertificationAuthorityPaginated
      }
      searchFilter={searchFilter}
      childrenContainerClassName="grid grid-cols-2 gap-5"
    >
      {(certificationAuthority) =>
        certificationAuthority ? (
          <CertificationAuthorityCard
            certificationAuthority={
              certificationAuthority as CertificationAuthority
            }
            buttonComponent={
              <Button
                className="ml-auto"
                priority="tertiary"
                onClick={() =>
                  setCertificationAuthoritySelected(
                    certificationAuthority as CertificationAuthority,
                  )
                }
              >
                Choisir
              </Button>
            }
          />
        ) : null
      }
    </SearchList>
  );
};
