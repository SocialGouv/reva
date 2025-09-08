import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Tile from "@codegouvfr/react-dsfr/Tile";
import Image from "next/image";

import { BackButton } from "@/components/back-button/BackButton";

import {
  getAapHelp,
  GetAapHelpPageItemsQuestionsFrequentesSection,
} from "./help.hook";

export const revalidate = 600;

const QuestionsFrequentesSection = ({
  questionsFrequentesSection,
}: {
  questionsFrequentesSection: GetAapHelpPageItemsQuestionsFrequentesSection;
}) => {
  if (!questionsFrequentesSection) return null;

  return (
    <div className="mb-8">
      <h2>Questions fréquentes</h2>
      <p className="text-xl">
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

const TutorielSection = () => {
  return (
    <>
      <h2>Tutoriels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Tile
          small
          orientation="horizontal"
          enlargeLinkOrButton
          linkProps={{
            href: "https://scribehow.com/viewer/Tutoriel_AAP__Gestion_des_candidatures_dans_lespace_professionnel__svyS0LK_SreOL8hrpQ75Hw?referrer=documents",
            target: "_",
          }}
          title="Gestion d'une candidature"
          pictogram={
            <Image
              src="/admin2/components/self-training.svg"
              alt="Gestion d'une candidature"
              width={40}
              height={40}
            />
          }
        />
        <Tile
          small
          orientation="horizontal"
          enlargeLinkOrButton
          linkProps={{
            href: "https://scribehow.com/viewer/Parametres_de_compte_de_lespace_professionnel_AAP__L1t9XG60QgORY97mqc-7tw",
            target: "_",
          }}
          title="Paramétrage de mon compte"
          pictogram={
            <Image
              src="/admin2/components/self-training.svg"
              alt="Paramétrage de mon compte"
              width={40}
              height={40}
            />
          }
        />
        <div className="hidden sm:block" />
      </div>
    </>
  );
};

const EspaceDocumentaireSection = () => {
  return (
    <>
      <h2>Espace documentaire et dernières modifications</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card
          horizontal
          size="small"
          enlargeLink
          linkProps={{
            href: "https://fabnummas.notion.site/Espace-documentaire-f697c4fa5fcf42d49d85428b5e0b40c5",
            target: "_",
          }}
          desc="Vous y trouverez l'ensemble des outils et ressources nécessaires pour prendre en main efficacement la plateforme numérique dédiée à la VAE, ainsi que les protocoles métier en lien avec vos missions spécifiques."
          title="Espace documentaire"
          ratio="33/66"
          imageComponent={
            <Image
              src="/admin2/components/espace-documentaire.png"
              alt="Espace documentaire"
              width={264}
              height={256}
            />
          }
          className="h-auto sm:col-span-2"
        />
        <Tile
          small
          enlargeLinkOrButton
          linkProps={{
            href: "https://fabnummas.notion.site/Nouveaut-s-de-l-espace-professionnel-AAP-et-certificateurs-et-de-l-espace-candidat-France-VAE-42e539695d68436abe32fcf4b146c192",
            target: "_",
          }}
          title="Nouvelles fonctionnalités"
          desc="Vous trouverez ici les dernières évolutions de votre espace professionnel France VAE"
          imageUrl="/admin2/components/innovation.svg"
          imageAlt="Nouvelles fonctionnalités"
          classes={{ img: "w-14 h-14 p-0 my-0" }}
        />
      </div>
    </>
  );
};

export default async function AapHelp() {
  const { questionsFrequentesSection } = await getAapHelp();

  return (
    <div>
      <h1>Aide</h1>
      <p className="text-xl">
        Retrouvez toute la documentation nécessaire à l’autonomie sur mon
        espace.
      </p>
      <TutorielSection />
      <hr className="pb-8" />
      <EspaceDocumentaireSection />
      <hr className="pb-8" />
      <QuestionsFrequentesSection
        questionsFrequentesSection={questionsFrequentesSection}
      />

      <BackButton href="/admin2" hasIcon={false}>
        Retour
      </BackButton>
    </div>
  );
}
