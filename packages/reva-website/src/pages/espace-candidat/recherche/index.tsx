import { CertificateAutocompleteDsfr } from "@/components/candidate-registration/certificate-autocomplete-dsfr/CertificateAutocompleteDsfr";
import BackGroundUnions from "@/components/candidate-space/BackGroundUnions";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import request from "graphql-request";
import { graphql } from "@/graphql/generated";
import { GRAPHQL_API_URL } from "@/config/config";
import { SearchCertificationsQueryForResultPageQuery } from "@/graphql/generated/graphql";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import Image from "next/image";
import Link from "next/link";

const searchCertificationsQuery = graphql(`
  query searchCertificationsQueryForResultPage(
    $searchText: String!
    $offset: Int
  ) {
    searchCertificationsForCandidate(
      searchText: $searchText
      limit: 50
      offset: $offset
    ) {
      rows {
        id
        label
        codeRncp
        isAapAvailable
      }
      info {
        totalRows
        currentPage
        totalPages
        pageLength
      }
    }
  }
`);

const CertificationResultPage = ({
  searchText,
  results,
  pageInfo,
}: {
  searchText: string;
  results: SearchCertificationsQueryForResultPageQuery["searchCertificationsForCandidate"]["rows"];
  pageInfo: SearchCertificationsQueryForResultPageQuery["searchCertificationsForCandidate"]["info"];
}) => {
  const router = useRouter();
  return (
    <MainLayout className="relative">
      <Head>
        <title>France VAE | Bienvenue sur le portail de la VAE</title>
        <meta
          name="description"
          content="Découvrez la version beta du portail officiel du service public de la Validation des Acquis de L'Expérience."
        />
      </Head>
      <BackGroundUnions double={false} />
      <div className="fr-container lg:shadow-lifted bg-white xl:mb-8 xl:!px-6 py-6">
        <Breadcrumb
          className="!mt-0 !mb-6"
          currentPageLabel={`Résultats de recherche pour "${searchText}"`}
          segments={[
            {
              label: "Candidats",
              linkProps: {
                href: "/espace-candidat/",
              },
            },
          ]}
        />
        <CertificateAutocompleteDsfr
          defaultLabel=""
          defaultValue={searchText}
          onSubmit={({ label }) => {
            router.push({
              pathname: "/espace-candidat/recherche",
              query: {
                searchText: label,
              },
            });
          }}
          onOptionSelection={(o) =>
            router.push({
              pathname: `/certifications/${o.value}`,
            })
          }
        />
        <div className="mt-6 flex flex-col min-h-[calc(100vh-180px)]">
          {(results?.length === 0 || searchText === "") && (
            <div className="bg-white border border-[#dddddd] p-8">
              <span className="fr-icon-search-line mr-2 " aria-hidden="true" />
              <p className="text-xl font-bold mt-4 mb-0">
                Aucune certification ou diplôme trouvés pour "{searchText}"
              </p>
              <p className="mt-0 mb-4 text-base text-dsfrGray-mentionGrey">
                Nous n’avons pas trouvé de résultat correspondant à votre
                recherche.
              </p>
              <p className="font-bold mt-0 mb-0">
                Plusieurs explications possibles :{" "}
              </p>
              <ul className="list-disc list-inside text-dsfrGray-mentionGrey">
                <li>
                  Votre saisie contient une orthographe approximative ou un
                  terme trop spécifique
                </li>
                <li>La certification recherchée n’est pas éligible à la VAE</li>
              </ul>
              <p className="font-bold mt-4 mb-0">Suggestions :</p>
              <ul className="list-disc list-inside text-dsfrGray-mentionGrey">
                <li>Vérifiez l’orthographe de votre recherche</li>
                <li>Élargissez votre requête avec des mots-clés génériques</li>
              </ul>
            </div>
          )}
          {results?.length > 0 && searchText !== "" && (
            <>
              <h4 className="mb-1">
                Résultats de recherche pour "{searchText}"
              </h4>
              <p className="mt-0 text-xs">
                Nombre de diplômes disponibles : {pageInfo.totalRows}
              </p>
              <div className="flex flex-col gap-2.5">
                {results.map((certification) => (
                  <div
                    className=" bg-white border border-[#dddddd] flex-col justify-start items-start gap-2.5 inline-flex"
                    key={certification.id}
                  >
                    <div className="flex-col gap-2.5 flex p-6">
                      <Tag small>
                        {certification?.isAapAvailable
                          ? "VAE en autonomie ou accompagnée"
                          : "VAE en autonomie"}
                      </Tag>
                      <p className="text-xs text-dsfrGray-mentionGrey mb-3">
                        <Image
                          width={16}
                          height={16}
                          src="/candidate-space/verified-badge.svg"
                          alt="Success pictogram"
                          aria-hidden="true"
                          className="mr-2 inline-block"
                        />
                        RNCP {certification?.codeRncp}
                      </p>
                      <Link
                        href={`/certifications/${certification?.id}`}
                        className="text-dsfrBlue-franceSun text-xl font-bold mt-0 mb-0 !bg-none hover:underline"
                      >
                        {certification?.label}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-auto mb-0 pt-8">
                <Pagination
                  defaultPage={pageInfo.currentPage}
                  count={pageInfo.totalPages}
                  getPageLinkProps={(page) => ({
                    href: `/espace-candidat/recherche?searchText=${searchText}&page=${page}`,
                  })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CertificationResultPage;

export async function getServerSideProps({
  query: { searchText, page },
}: {
  query: { searchText: string; page: string };
}) {
  const offset = page ? (parseInt(page) - 1) * 50 : 0;
  const resultsResponse = await request(
    GRAPHQL_API_URL,
    searchCertificationsQuery,
    {
      searchText,
      offset,
    },
  );
  const results = resultsResponse.searchCertificationsForCandidate.rows;
  const pageInfo = resultsResponse.searchCertificationsForCandidate.info;
  return { props: { searchText: searchText ?? "", results, pageInfo } };
}
