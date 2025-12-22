"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { SearchBar } from "@/components/legacy/molecules/SearchBar/SearchBar";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { PageLayout } from "@/layouts/page.layout";

import {
  useCandidacyForCertificationSearch,
  useSetCertification,
} from "./search-certification.hooks";

export default function SetCertification() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const searchFilter = searchParams.get("search") || "";
  const currentPage = page ? Number.parseInt(page) : 1;

  const { candidacyId, candidacy, canEditCandidacy, isLoading } =
    useCandidacyForCertificationSearch();

  const { searchCertificationsForCandidate } = useSetCertification({
    searchText: searchFilter,
    currentPage,
    candidacyId: candidacyId,
  });

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (!canEditCandidacy) {
    redirect("/");
  }

  const info =
    searchCertificationsForCandidate.data?.searchCertificationsForCandidate
      .info;

  const rows =
    searchCertificationsForCandidate.data?.searchCertificationsForCandidate
      .rows;

  return (
    <PageLayout title="Choix du diplôme" data-testid={`certificates`}>
      <Breadcrumb
        currentPageLabel="Choisir un diplôme"
        className="mb-0"
        segments={
          candidacy?.certification?.id
            ? [
                {
                  label: "Ma candidature",
                  linkProps: {
                    href: "../",
                  },
                },
                {
                  label: "Diplôme visé",
                  linkProps: {
                    href: `../certification/${candidacy.certification?.id}`,
                  },
                },
              ]
            : [
                {
                  label: "Ma candidature",
                  linkProps: {
                    href: "../",
                  },
                },
              ]
        }
      />
      <>
        <h1 className="mt-4 mb-8">Choisir un diplôme</h1>
        <div className="mb-8 border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 px-8 w-full">
          <h2 className="mb-6">Recherchez parmi les diplômes disponibles</h2>
          <SearchBar
            label="Rechercher"
            searchFilter={searchFilter}
            onSearchFilterChange={(filter) => {
              const queryParams = new URLSearchParams(searchParams);
              if (filter && queryParams.get("page")) {
                queryParams.set("page", "1");
                queryParams.set("search", filter);
              } else if (filter) {
                queryParams.set("search", filter);
              } else {
                queryParams.delete("search");
              }

              const path = `${pathname}?${queryParams.toString()}`;
              router.push(path);
            }}
          />
        </div>

        {info && rows && (
          <>
            <p className="mb-2" role="status">
              Nombre de diplômes disponibles : {info?.totalRows}
            </p>
            <div className="flex flex-col gap-2.5">
              {rows?.map((certification) => (
                <Card
                  size="small"
                  title={certification.label}
                  detail={`RNCP ${certification.codeRncp}`}
                  desc={certification.certificationAuthorityStructure?.label}
                  key={certification.id}
                  linkProps={{
                    href: `../certification/${certification.id}`,
                  }}
                  enlargeLink
                  classes={{
                    detail: "mt-2",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-center mt-auto mb-0 pt-8">
              <Pagination
                defaultPage={info.currentPage}
                count={info.totalPages}
                getPageLinkProps={(page) => ({
                  href: `../search-certification?search=${searchFilter}&page=${page}`,
                })}
              />
            </div>
          </>
        )}
      </>
    </PageLayout>
  );
}
