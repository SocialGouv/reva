"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { DossierDeValidationCategoryFilter } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CandidacySearchList } from "../(components)/CandidacySearchList";
import Button from "@codegouvfr/react-dsfr/Button";

const RECORDS_PER_PAGE = 10;

const getDossiersDeValidationQuery = graphql(`
  query getDossiersDeValidation(
    $offset: Int
    $limit: Int
    $searchFilter: String
    $categoryFilter: DossierDeValidationCategoryFilter
    $certificationAuthorityId: ID
  ) {
    dossierDeValidation_getDossiersDeValidation(
      categoryFilter: $categoryFilter
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
      certificationAuthorityId: $certificationAuthorityId
    ) {
      rows {
        id
        candidacy {
          id
          certification {
            label
          }
          candidate {
            firstname
            lastname
            department {
              label
              code
            }
          }
        }
        dossierDeValidationFile {
          url
          name
        }
        dossierDeValidationOtherFiles {
          url
          name
        }
        dossierDeValidationSentAt
        decisionComment
        decisionSentAt
        isActive
        createdAt
        updatedAt
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const DossiersDeValidationPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";
  const certificationAuthorityId = searchParams.get(
    "certificationAuthorityId",
  ) as string | undefined;

  const category = searchParams.get("CATEGORY");

  const { replace } = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("CATEGORY", category || "ALL");
    params.set("page", page || "1");

    if (!page || !category) {
      replace(`${currentPathname}?${params.toString()}`);
    }
  }, [replace, page, category, currentPathname]);

  const { isAdmin } = useAuth();

  const { data: getDossiersDeValidationResponse } = useQuery({
    queryKey: [
      "getDossiersDeValidation",
      searchFilter,
      currentPage,
      category,
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(getDossiersDeValidationQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
        searchFilter,
        categoryFilter: (category === null || category === "ALL"
          ? undefined
          : category) as DossierDeValidationCategoryFilter,
        certificationAuthorityId,
      }),
  });

  const dossierDeValidationPage =
    getDossiersDeValidationResponse?.dossierDeValidation_getDossiersDeValidation;

  const categoryLabel = useMemo(() => {
    switch (category) {
      case "PENDING":
        return "Dossiers de validation reçus / jurys à programmer";
      case "INCOMPLETE":
        return "Dossiers de validation signalés";
      default:
        return "Tous les dossiers de validation";
    }
  }, [category]);

  const getPathnameWithoutCertificationAuthorityId = (): string => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("certificationAuthorityId");
    return `${currentPathname}?${currentParams.toString()}`;
  };

  return (
    dossierDeValidationPage && (
      <div className="flex flex-col">
        {isAdmin ? (
          certificationAuthorityId ? (
            <div>
              <h1>Candidatures de la structure</h1>
              <Button
                priority="secondary"
                linkProps={{
                  href: getPathnameWithoutCertificationAuthorityId(),
                }}
              >
                Accéder à toutes les candidatures
              </Button>
              <p className="mt-6">
                Ici, vous pouvez rechercher une ou plusieurs candidatures gérées
                par cette structure. Pour retrouver toutes les candidatures de
                la plateforme, cliquez sur “Accéder à toutes les candidatures”.
              </p>
            </div>
          ) : (
            <h1>Espace pro administrateur</h1>
          )
        ) : (
          <h1>Espace certificateur</h1>
        )}

        <CandidacySearchList
          title={categoryLabel}
          searchFilter={searchFilter}
          searchResultsPage={dossierDeValidationPage}
          searchResultLink={(candidacyId) =>
            `/candidacies/${candidacyId}/dossier-de-validation`
          }
        >
          {(r) => (
            <p className="text-lg col-span-2 mb-0">
              Dossier envoyé le{" "}
              {format(r?.dossierDeValidationSentAt, "d MMM yyyy")}
            </p>
          )}
        </CandidacySearchList>
      </div>
    )
  );
};

export default DossiersDeValidationPage;
