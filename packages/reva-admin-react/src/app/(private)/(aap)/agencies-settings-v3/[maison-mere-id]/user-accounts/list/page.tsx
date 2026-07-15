"use client";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { formatDate } from "date-fns";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { SearchList } from "@/components/search/search-list/SearchList";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";

import { AccountsListEmptyState } from "./AccountsListEmptyState";
import { useCollaborateurAccountsList } from "./collaborateurAccountsList.hook";

export default function UserAccountsListPage() {
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";
  const { isAdmin } = useAuth();

  const {
    comptesCollaborateursPage,
    collaborateurAccountsListStatus,
    maisonMereAAPId,
    maisonMereRaisonSociale,
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

  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  return (
    <div className="flex flex-col gap-4 w-full">
      <SettingsBreadcrumb
        currentPageLabel="Comptes collaborateurs"
        segments={[
          {
            label: maisonMereRaisonSociale,
            linkProps: {
              href: backUrl,
            },
          },
        ]}
      />
      <h1>Comptes collaborateurs</h1>
      <SearchList
        searchFilter={searchFilter}
        searchResultsPage={comptesCollaborateursPage}
        searchBarProps={{
          placeholder:
            "Rechercher par nom, prénom, adresse électronique etc...",
        }}
        addButton={
          isAdmin ? null : (
            <Button
              priority="tertiary no outline"
              className="text-sm"
              iconId="fr-icon-add-line"
              linkProps={{
                href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/add-user-account`,
              }}
            >
              Ajouter un compte
            </Button>
          )
        }
      >
        {(collaborateurAccount) => (
          <Card
            key={collaborateurAccount.id}
            size="small"
            title={`${collaborateurAccount.firstname} ${collaborateurAccount.lastname}`}
            desc={collaborateurAccount.email}
            start={
              collaborateurAccount.disabledAt ? (
                <Badge severity="warning" small noIcon>
                  Désactivé depuis le{" "}
                  {formatDate(collaborateurAccount.disabledAt, "dd/MM/yyyy")}
                </Badge>
              ) : (
                <Tag small className="mb-1">
                  {collaborateurAccount.organisms.length} organisme
                  {collaborateurAccount.organisms.length > 1 ? "s" : ""}
                </Tag>
              )
            }
            {...(collaborateurAccount.disabledAt
              ? {
                  linkProps: undefined,
                }
              : {
                  enlargeLink: true,
                  linkProps: {
                    href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/${collaborateurAccount.id}`,
                  },
                })}
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
