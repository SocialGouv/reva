"use client";
import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { formatDate } from "date-fns";
import { useSearchParams } from "next/navigation";

import { SearchList } from "@/components/search/search-list/SearchList";

import { AccountsListEmptyState } from "./AccountsListEmptyState";
import { useCollaborateurAccountsList } from "./collaborateurAccountsList.hook";

export default function UserAccountsListPage() {
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";

  const {
    comptesCollaborateursPage,
    collaborateurAccountsListStatus,
    maisonMereAAPId,
  } = useCollaborateurAccountsList({
    searchFilter,
    page: currentPage,
  });

  if (
    collaborateurAccountsListStatus === "pending" ||
    !comptesCollaborateursPage
  ) {
    return <div>Chargement des comptes collaborateurs...</div>;
  }

  if (collaborateurAccountsListStatus === "error") {
    return (
      <div>
        Une erreur est survenue lors du chargement des comptes collaborateurs.
      </div>
    );
  }

  if (
    (!comptesCollaborateursPage ||
      comptesCollaborateursPage.rows.length === 0) &&
    searchFilter === ""
  ) {
    return (
      <div className="flex flex-col justify-center w-full px-6">
        <AccountsListEmptyState maisonMereAAPId={maisonMereAAPId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1>Comptes collaborateurs</h1>
      <SearchList
        searchFilter={searchFilter}
        searchResultsPage={comptesCollaborateursPage}
        searchBarProps={{
          placeholder:
            "Rechercher par nom, prénom, adresse électronique etc...",
        }}
      >
        {(collaborateurAccount) => (
          <Card
            key={collaborateurAccount.id}
            size="small"
            title={`${collaborateurAccount.firstname} ${collaborateurAccount.lastname}`}
            desc={collaborateurAccount.email}
            start={
              <Tag small className="mb-1">
                {collaborateurAccount.agences.length} organisme
                {collaborateurAccount.agences.length > 1 ? "s" : ""}
              </Tag>
            }
            enlargeLink
            linkProps={{
              href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/${collaborateurAccount.id}`,
            }}
            endDetail={
              collaborateurAccount.disabledAt
                ? `Compte désactivé le ${formatDate(collaborateurAccount.disabledAt, "dd/MM/yyyy")}`
                : ""
            }
          />
        )}
      </SearchList>
    </div>
  );
}
