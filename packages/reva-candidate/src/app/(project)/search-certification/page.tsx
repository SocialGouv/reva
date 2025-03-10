"use client";

import { FormEvent, useState } from "react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import { PageLayout } from "@/layouts/page.layout";

import { SearchBar } from "@/components/legacy/molecules/SearchBar/SearchBar";
import { Card } from "@codegouvfr/react-dsfr/Card";

import {
  useCandidacyForCertificationSearch,
  useSetCertification,
} from "./search-certification.hooks";
import Link from "next/link";
import { graphqlErrorToast } from "@/components/toast/toast";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

export default function SetCertification() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const searchFilter = searchParams.get("search") || "";
  const currentPage = page ? Number.parseInt(page) : 1;

  const { canEditCandidacy, candidacy } = useCandidacyForCertificationSearch();

  const { searchCertificationsForCandidate, updateCertification } =
    useSetCertification({
      searchText: searchFilter,
      currentPage,
    });

  const [selectedCertificationId, setSelectedCertificationId] = useState<
    string | undefined
  >();

  if (!canEditCandidacy) {
    redirect("/");
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await updateCertification.mutateAsync({
        candidacyId: candidacy.id,
        certificationId: selectedCertificationId!,
      });
      if (response) {
        router.push("/");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const info =
    searchCertificationsForCandidate.data?.searchCertificationsForCandidate
      .info;

  const rows =
    searchCertificationsForCandidate.data?.searchCertificationsForCandidate
      .rows;

  const selectedCertification = rows?.find(
    (certification) => certification.id == selectedCertificationId,
  );

  return (
    <PageLayout title="Choix du diplôme" data-test={`certificates`}>
      <Breadcrumb
        currentPageLabel="Choisir un diplôme"
        className="mb-0"
        homeLinkProps={{
          href: "/",
        }}
        segments={[
          {
            label: "Diplôme visé",
            linkProps: {
              href: `/certification/${candidacy.certification?.id}`,
            },
          },
        ]}
      />
      {!selectedCertification && (
        <>
          <h1 className="mt-6 mb-8">Choisir un diplôme</h1>
          <div className="mb-8 border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 px-8 w-full">
            <h2 className="mb-6">
              Recherchez parmi les diplômes disponibles sur France VAE
            </h2>
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
                    key={certification.id}
                    linkProps={{
                      href: `/`,
                      onClick: (e) => {
                        e.preventDefault();
                        setSelectedCertificationId(certification.id);
                      },
                    }}
                    enlargeLink
                    start={
                      <Tag small>
                        {certification?.isAapAvailable
                          ? "VAE en autonomie ou accompagnée"
                          : "VAE en autonomie"}
                      </Tag>
                    }
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
                    href: `/search-certification?search=${searchFilter}&page=${page}`,
                  })}
                />
              </div>
            </>
          )}
        </>
      )}

      {selectedCertification && (
        <form onSubmit={onSubmit}>
          <h2
            data-test="certification-label"
            className="mt-6 mb-2 text-2xl font-bold text-black "
          >
            {selectedCertification.label}
          </h2>
          <p data-test="certification-code-rncp" className="text-xs mb-4">
            Code RNCP: {selectedCertification.codeRncp}
          </p>
          <div className="mb-12 h-5 px-1.5 bg-[#e8edff] rounded justify-center items-center leading-tight inline-flex text-[#0063cb] text-xs font-bold uppercase ">
            VAE EN AUTONOMIE ou accompagnée
          </div>
          <p>
            <a
              data-test="certification-more-info-link"
              target="_blank"
              rel="noreferrer"
              href={`https://www.francecompetences.fr/recherche/rncp/${selectedCertification.codeRncp}/`}
              className="text-dsfrBlue-500"
            >
              Lire les détails de la fiche diplôme
            </a>
          </p>

          <CallOut
            title="À quoi sert un accompagnateur ?"
            classes={{ title: "pb-2" }}
            className="w-full md:w-3/5 mt-8 mb-12"
          >
            C’est un expert de la VAE qui vous aide à chaque grande étape de
            votre parcours : rédaction du dossier de faisabilité, communication
            avec le certificateur, préparation au passage devant le jury, etc.
            <br />
            <br />
            <strong>Bon à savoir :</strong> ces accompagnements peuvent être en
            partie financés par votre{" "}
            <Link
              href="https://www.moncompteformation.gouv.fr/espace-public/consulter-mes-droits-formation"
              target="_blank"
            >
              Compte Personnel de Formation
            </Link>
            . Nous attirons votre attention sur le fait que les frais liés à
            votre passage devant le jury et les actions de formations
            complémentaires sont entièrement à votre charge.
          </CallOut>

          <div className="flex flex-col-reverse md:flex-row gap-4 justify-between mt-6">
            <Button
              priority="secondary"
              className="justify-center w-[100%]  md:w-fit"
              onClick={() => setSelectedCertificationId(undefined)}
            >
              Retour
            </Button>
            <Button
              data-test="submit-certification-button"
              className="justify-center w-[100%]  md:w-fit"
            >
              Choisir
            </Button>
          </div>
        </form>
      )}
    </PageLayout>
  );
}
