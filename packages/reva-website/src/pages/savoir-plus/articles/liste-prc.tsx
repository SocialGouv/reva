import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  GetArticleDAideQuery,
  GetPrCsQuery,
} from "@/graphql/generated/graphql";
import { getArticleDAide, getPRCs } from "@/utils/strapiQueries";
import Head from "next/head";

const ListePrcPage = ({
  prcsResponse,
  articleResponse,
}: {
  prcsResponse: GetPrCsQuery;
  articleResponse: GetArticleDAideQuery;
}) => {
  const prcs = prcsResponse?.prcs?.data;
  const article = articleResponse?.articleDAides?.data[0];

  if (!article || !prcs) return null;
  return (
    <>
      <Head>
        <title>France VAE | {article.attributes?.titre ?? ""}</title>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content={article.attributes?.description ?? ""}
        />
        <meta name="keywords" content="Gouvernement, France, VAE, France VAE" />
        <meta name="author" content="France VAE" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:url"
          content={`https://vae.gouv.fr/savoir-plus/articles/${article.attributes?.slug}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`France VAE | ${article.attributes?.titre ?? ""}`}
        />
        <meta
          property="og:description"
          content={article.attributes?.description ?? ""}
        />
        <meta
          property="og:image"
          content={article.attributes?.vignette.data?.attributes?.url ?? ""}
        />
      </Head>
      <MainLayout>
        {
          <div className="flex flex-col sm:flex-row w-full gap-8 sm:gap-16 fr-container p-32 pt-16">
            <div>
              <h1 className="font-bold mb-12" style={{ fontSize: "40px" }}>
                {article.attributes?.titre}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prcs?.map((prc) => (
                  <div key={prc.id} className="flex flex-col border p-6 gap-2">
                    <h1 className="text-2xl font-bold mb-4">
                      {prc.attributes?.nom}
                    </h1>
                    <div>
                      <span
                        className="fr-icon-home-4-line fr-icon--sm mr-2"
                        aria-hidden="true"
                        aria-label="Adresse"
                        title="Adresse"
                      ></span>
                      {prc.attributes?.adresse}
                      <br />
                      {prc.attributes?.departement?.data?.attributes?.nom} (
                      {prc.attributes?.departement?.data?.attributes?.code})
                    </div>
                    <div>
                      <span
                        className="fr-icon-mail-line fr-icon--sm mr-2"
                        aria-hidden="true"
                        aria-label="Email"
                        title="Email"
                      ></span>
                      {prc.attributes?.email}
                    </div>
                    {prc.attributes?.mandataire && (
                      <div>
                        <span
                          className="fr-icon-team-line fr-icon--sm mr-2"
                          aria-hidden="true"
                          aria-label="Mandataire"
                          title="Mandataire"
                        ></span>
                        {prc.attributes?.mandataire}
                      </div>
                    )}
                    <div>
                      <span
                        className="fr-icon-phone-line fr-icon--sm mr-2"
                        aria-hidden="true"
                        aria-label="Téléphone"
                        title="Téléphone"
                      ></span>
                      {prc.attributes?.telephone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      </MainLayout>
    </>
  );
};

export async function getServerSideProps() {
  const prcsResponse = await getPRCs();
  const articleResponse = await getArticleDAide("liste-prc", false);
  return { props: { prcsResponse, articleResponse } };
}

export default ListePrcPage;
