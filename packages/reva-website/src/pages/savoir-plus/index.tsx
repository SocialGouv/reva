"use client";

import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import {
  ArticleDAideEntity,
  GetSectionDAidesQuery,
} from "@/graphql/generated/graphql";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";
import request from "graphql-request";
import { truncate } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
                slug
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
  const [
    numberOfArticlesToDisplayInitially,
    setNumberOfArticlesToDisplayInitially,
  ] = useState(4);

  const [textArticleToTruncate, setTextArticleToTruncate] = useState({
    forLongTitle: 90,
    forShortTitle: 120,
  });

  useEffect(() => {
    const screenWidth = window.innerWidth;
    setNumberOfArticlesToDisplayInitially(screenWidth < 1200 ? 2 : 4);
    setTextArticleToTruncate({
      forLongTitle: screenWidth < 1024 ? 90 : 200,
      forShortTitle: screenWidth < 1024 ? 120 : 250,
    });
  }, []);

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
    <div className="flex flex-col md:flex-row flex-wrap gap-8 items-center lg:items-start">
      {articlesToDisplay.map(({ id, attributes }) => {
        const isLongTitle = (attributes?.titre?.length ?? 0) > 40;

        return (
          <HelpArticle
            key={id}
            title={attributes?.titre || ""}
            description={truncate(attributes?.description || "", {
              length: isLongTitle
                ? textArticleToTruncate.forLongTitle
                : textArticleToTruncate.forShortTitle,
            })}
            thumbnailUrl={attributes?.vignette?.data?.attributes?.url || ""}
            thumbnailAlt={
              attributes?.vignette?.data?.attributes?.alternativeText || ""
            }
            url={`/savoir-plus/articles/${attributes?.slug}`}
          />
        );
      })}
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
    <div className="grid w-[340px] h-[150px] lg:h-[400px] rounded-[32px] bg-white shadow-[0px_8px_24px_0px_rgba(11,11,248,0.16)] hover:scale-105 transition-all">
      <div className="hidden lg:flex">
        <Image
          src={thumbnailUrl}
          alt={thumbnailAlt}
          width={340}
          height={150}
          className="object-cover w-full rounded-t-[32px] max-w-[340px] max-h-[150px]"
        />
      </div>
      <div className="flex flex-col p-4 sm:p-6 h-auto justify-center lg:justify-start">
        <h4 className="text-md sm:text-xl font-bold mb-2 lg:mb-6">{title}</h4>
        <span className="text-sm sm:text-md sm:overflow-hidden">
          {description}
        </span>
      </div>
    </div>
  </Link>
);

const SavoirPlusPage = ({ sections }: { sections: GetSectionDAidesQuery }) => {
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
          {sections?.sectionDAides?.data.map((sa, index) => {
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

export async function getServerSideProps() {
  const sections = await request(STRAPI_GRAPHQL_API_URL, sectionsQuery);
  return { props: { sections } };
}

export default SavoirPlusPage;
