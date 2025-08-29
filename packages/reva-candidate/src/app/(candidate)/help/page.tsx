import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

import { PageLayout } from "@/layouts/page.layout";
import { getStrapiImageUrl } from "@/utils/getStrapiImageUrl.util";

import {
  getHelpPageItems,
  HelpPageItemsQuestionsFrequentesSection,
  HelpPageItemsRessourcesUtileSection,
  HelpPageItemsTutorielSection,
} from "./get-help-page-items";

const TutorielSection = ({
  tutorielSection,
}: {
  tutorielSection: HelpPageItemsTutorielSection;
}) => {
  if (!tutorielSection) return null;

  return (
    <div className="mb-8">
      <h2>{tutorielSection.titre}</h2>
      <p>{tutorielSection.sous_titre}</p>
      <div className="flex gap-6 flex-wrap justify-center sm:justify-start">
        {tutorielSection.aide_candidat_section_tutoriel_cartes.map((c) => {
          if (!c) return null;
          const cardDetail = `Mise à jour : ${format(
            new Date(c?.updatedAt ?? ""),
            "dd/MM/yyyy",
          )}`;
          const imageUrl = getStrapiImageUrl(
            c.icone_svg?.formats?.small?.url ?? c.icone_svg?.url,
          );
          return (
            <Tile
              key={c.documentId}
              small
              orientation="horizontal"
              enlargeLinkOrButton
              linkProps={{
                href: c.lien,
                target: "_",
              }}
              detail={cardDetail}
              imageAlt={c.icone_svg?.alternativeText ?? ""}
              imageUrl={imageUrl}
              title={c.titre}
            />
          );
        })}
      </div>
    </div>
  );
};

const QuestionsFrequentesSection = ({
  questionsFrequentesSection,
}: {
  questionsFrequentesSection: HelpPageItemsQuestionsFrequentesSection;
}) => {
  if (!questionsFrequentesSection) return null;

  return (
    <div className="mb-8">
      <h2>{questionsFrequentesSection.titre}</h2>
      <p>{questionsFrequentesSection.sous_titre}</p>

      <div className={fr.cx("fr-accordions-group")}>
        {questionsFrequentesSection.aide_candidat_section_questions_frequentes_questions.map(
          (q) => {
            if (!q) return null;
            return (
              <Accordion key={q.question} label={q.question}>
                <span dangerouslySetInnerHTML={{ __html: q.reponse }} />
              </Accordion>
            );
          },
        )}
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
      <h2>{ressourcesUtileSection.titre}</h2>
      <p>{ressourcesUtileSection.sous_titre}</p>
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
  const {
    tutorielSection,
    ressourcesUtileSection,
    questionsFrequentesSection,
  } = await getHelpPageItems();
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
      <TutorielSection tutorielSection={tutorielSection} />
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
