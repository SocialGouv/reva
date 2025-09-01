import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { PageLayout } from "@/layouts/page.layout";

import {
  getHelpPageItems,
  HelpPageItemsQuestionsFrequentesSection,
  HelpPageItemsRessourcesUtileSection,
} from "./get-help-page-items";

export const revalidate = 600;

const TutorielSection = () => (
  <div className="mb-8">
    <h2>Tutoriel et dernières modifications</h2>
    <p>Retrouvez le tutoriel complet de votre espace.</p>
    <div className="flex gap-6 flex-wrap justify-center sm:justify-start">
      <Tile
        small
        orientation="horizontal"
        enlargeLinkOrButton
        linkProps={{
          href: "https://scribehow.com/shared/Parcours_candidat__vp9k4YzATvmheao9kAoKjw",
          target: "_",
        }}
        detail="Mise à jour : 01/09/2025"
        imageAlt="Tutoriel France VAE"
        imageUrl="/candidat/images/pictograms/self-training.svg"
        title="Tutoriel France VAE"
      />
      <Tile
        small
        orientation="horizontal"
        enlargeLinkOrButton
        linkProps={{
          href: "https://www.notion.so/fabnummas/Nouveaut-s-de-l-espace-professionnel-AAP-et-certificateurs-et-de-l-espace-candidat-France-VAE-42e539695d68436abe32fcf4b146c192",
          target: "_",
        }}
        detail="Mise à jour : 01/09/2025"
        imageAlt="Nouveautés France VAE"
        imageUrl="/candidat/images/pictograms/innovation.svg"
        title="Nouveautés France VAE"
      />
    </div>
  </div>
);

const QuestionsFrequentesSection = ({
  questionsFrequentesSection,
}: {
  questionsFrequentesSection: HelpPageItemsQuestionsFrequentesSection;
}) => {
  if (!questionsFrequentesSection) return null;

  return (
    <div className="mb-8">
      <h2>Questions fréquentes</h2>
      <p>
        Avant de contacter le support, vérifiez que vous n’avez pas la réponse
        ici.
      </p>

      <div className={fr.cx("fr-accordions-group")}>
        {questionsFrequentesSection.faq_article_faqs?.map((q) => {
          if (!q) return null;
          return (
            <Accordion key={q.question} label={q.question}>
              <div
                className="ck-content"
                dangerouslySetInnerHTML={{
                  __html: q?.reponse?.replaceAll("<a", "<a target='_'") || "",
                }}
              />
            </Accordion>
          );
        })}
      </div>
      <div className="flex justify-end mt-6">
        <Button
          priority="tertiary no outline"
          size="small"
          linkProps={{ href: questionsFrequentesSection.lien_voir_plus }}
        >
          Voir toutes les questions fréquentes
        </Button>
      </div>
    </div>
  );
};

const RessourcesUtileSection = ({
  ressourcesUtileSection,
}: {
  ressourcesUtileSection: HelpPageItemsRessourcesUtileSection;
}) => {
  if (!ressourcesUtileSection) return null;

  return (
    <div className="mb-8">
      <h2>Ressources utiles</h2>
      <p>
        À la recherche de plus d’informations ? Découvrez nos articles de blog
        pour mieux comprendre, préparer et réussir sa VAE.
      </p>
      <div className="flex gap-6 flex-wrap sm:flex-nowrap justify-center sm:justify-start">
        {ressourcesUtileSection.aide_article_d_aides.map((c) => {
          if (!c) return null;
          return (
            <Card
              key={c.documentId}
              enlargeLink
              linkProps={{
                href: `/savoir-plus/articles/${c.slug}`,
                target: "_",
              }}
              desc={c.description}
              title={c.titre}
              className="max-w-[384px] max-h-[264px]"
            />
          );
        })}
      </div>
      <div className="flex justify-end mt-6">
        <Button
          priority="tertiary no outline"
          size="small"
          linkProps={{ href: ressourcesUtileSection.lien_voir_plus }}
        >
          Voir toutes les ressources utiles
        </Button>
      </div>
    </div>
  );
};

export default async function HelpPage() {
  const { ressourcesUtileSection, questionsFrequentesSection } =
    await getHelpPageItems();
  return (
    <PageLayout title="Aide">
      <Breadcrumb
        currentPageLabel="Aide"
        className="mb-4"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "/candidat",
            },
          },
        ]}
      />
      <h1 className="mb-6">Aide</h1>
      <p className="text-xl mb-12">
        Retrouvez toute la documentation nécessaire à l'autonomie sur mon
        espace.
      </p>
      <TutorielSection />
      <QuestionsFrequentesSection
        questionsFrequentesSection={questionsFrequentesSection}
      />
      <RessourcesUtileSection ressourcesUtileSection={ressourcesUtileSection} />
      <Button priority="secondary" linkProps={{ href: "/candidat" }}>
        Retour
      </Button>
    </PageLayout>
  );
}
