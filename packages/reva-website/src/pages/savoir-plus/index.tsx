import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { ArticleDAideEntity } from "@/graphql/generated/graphql";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { truncate } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const ArrowRight = () => (
  <span className="fr-icon-arrow-right-line" aria-hidden="true" />
);

const sectionsQuery = graphql(`
  query getSectionDAides {
    sectionDAides(sort: "ordre") {
      data {
        id
        attributes {
          titre
          article_d_aides(sort: "ordre") {
            data {
              id
              attributes {
                titre
                vignette {
                  data {
                    attributes {
                      url
                      alternativeText
                    }
                  }
                }
                description
              }
            }
          }
        }
      }
    }
  }
`);

const HelpSection = ({ articles }: { articles: ArticleDAideEntity[] }) => {
  const numberOfArticlesToDisplayInitially = window.innerWidth < 1200 ? 2 : 4;
  const [showMore, setShowMore] = useState(false);
  const articlesToDisplay = useMemo(
    () =>
      showMore
        ? articles
        : articles.slice(0, numberOfArticlesToDisplayInitially),
    [showMore, articles, numberOfArticlesToDisplayInitially]
  );
  const displayMoreButton =
    articles.length > numberOfArticlesToDisplayInitially && !showMore;

  return (
    <div className="flex flex-col lg:flex-row flex-wrap gap-8 items-center lg:items-start">
      {articlesToDisplay.map(({ id, attributes }) => (
        <HelpArticle
          key={id}
          title={attributes?.titre || ""}
          description={truncate(attributes?.description || "", {
            length: 120,
          })}
          thumbnailUrl={attributes?.vignette?.data?.attributes?.url || ""}
          thumbnailAlt={
            attributes?.vignette?.data?.attributes?.alternativeText || ""
          }
          url={`/savoir-plus/articles/${id}`}
        />
      ))}
      {displayMoreButton && (
        <div className="flex w-full justify-center lg:justify-end lg:pr-16">
          <Button
            priority="secondary"
            onClick={() => {
              setShowMore(true);
            }}
          >
            <span className="mr-2">Voir tous les articles...</span>
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
};

const HelpArticle = ({
  title,
  description,
  thumbnailUrl,
  thumbnailAlt,
  url,
}: {
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  url: string;
}) => (
  <Link href={url} className="!bg-none">
    <div className="grid grid-rows-2 w-[340px]  h-[200px] lg:h-[400px] rounded-[32px] bg-white shadow-[0px_8px_24px_0px_rgba(11,11,248,0.16)] hover:scale-105">
      <div className="flex">
        <Image
          src={thumbnailUrl}
          alt={thumbnailAlt}
          width={340}
          height={200}
          className="object-cover w-full rounded-t-[32px] max-w-[340px] max-h-[200px]"
        />
      </div>
      <div className="flex flex-col p-6">
        <h4 className="text-2xl font-bold">{title}</h4>
        <div className="hidden lg:block overflow-hidden">{description}</div>
      </div>
    </div>
  </Link>
);

const SavoirPlusPage = () => {
  const sections = useQuery({
    queryKey: ["sections"],
    queryFn: async () => request(STRAPI_GRAPHQL_API_URL, sectionsQuery),
  });

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="flex flex-col min-h-[300px] items-center justify-center bg-white p-4">
          <h1 className="text-5xl font-bold">En savoir plus sur la VAE</h1>
          <h2 className="text-2xl font-bold">
            Trouvez des réponses à vos questions à propos de votre VAE.
          </h2>
          <div className="flex gap-4">
            <Button size="small">
              <a href="https://reva.crisp.help/fr/category/candidat-rhr5rx/">
                Foire aux questions
              </a>
            </Button>
            <Button priority="secondary" size="small">
              <a href="https://vae.gouv.fr/nous-contacter/">Nous contacter</a>
            </Button>
          </div>
        </div>
        <div className="flex flex-col p-4 lg:p-32 lg:pt-8 ">
          {sections.data?.sectionDAides?.data?.map((sa, index) => {
            const articles = sa.attributes?.article_d_aides?.data;
            if (!articles?.length) return null;

            return (
              <Accordion
                label={
                  <span className="text-2xl text-dsfrBlue-franceSun">
                    {sa.attributes?.titre || ""}
                  </span>
                }
                defaultExpanded={!index}
                key={sa.id}
              >
                <HelpSection articles={articles as ArticleDAideEntity[]} />
              </Accordion>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default SavoirPlusPage;
