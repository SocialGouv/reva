import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Tile from "@codegouvfr/react-dsfr/Tile";
import Image from "next/image";

import { BackButton } from "@/components/back-button/BackButton";

import {
  getCertificationAuthoritiesHelp,
  GetCertificationAuthoritiesHelpPageItemsQuestionsFrequentesSection,
} from "./help.hook";

export const revalidate = 600;

const QuestionsFrequentesSection = ({
  questionsFrequentesSection,
}: {
  questionsFrequentesSection: GetCertificationAuthoritiesHelpPageItemsQuestionsFrequentesSection;
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
      <div className="flex gap-6 flex-wrap justify-center sm:justify-start mb-8">
        <Tile
          small
          orientation="horizontal"
          enlargeLinkOrButton
          linkProps={{
            href: "https://scribehow.com/viewer/Tutoriel_certificateurs__gestion_des_candidatures__iAOKgJsISUOp5K7_zfYhzw",
            target: "_",
          }}
          detail="Mise à jour : 01/09/2025"
          imageAlt="Gestion d'une candidature"
          imageUrl="/admin2/components/self-training.svg"
          title="Gestion d'une candidature"
        />
        <Tile
          small
          orientation="horizontal"
          enlargeLinkOrButton
          linkProps={{
            href: "https://scribehow.com/viewer/Tutoriel_du_Responsable_des_Certifications__7T3db0CzTtSaRV4tXSubfw",
            target: "_",
          }}
          detail="Mise à jour : 01/09/2025"
          imageAlt="Responsable des certifications"
          imageUrl="/admin2/components/self-training.svg"
          title="Responsable des certifications"
        />
      </div>
    </>
  );
};

const EspaceDocumentaireSection = () => {
  return (
    <>
      <h2>Espace documentaire et dernières modifications</h2>
      <div className="flex gap-6 justify-center flex-col sm:flex-row sm:justify-start mb-8">
        <Card
          horizontal
          size="small"
          enlargeLink
          linkProps={{
            href: "https://fabnummas.notion.site/Espace-documentaire-659cdc012ab24c788cefbda97441510b",
            target: "_",
          }}
          desc="Vous y trouverez l'ensemble des outils et ressources nécessaires pour prendre en main efficacement la plateforme numérique dédiée à la VAE, ainsi que les protocoles métier en lien avec vos missions spécifiques."
          title="Espace documentaire"
          ratio="33/66"
          imageComponent={
            <Image
              src="/admin2/components/espace-documentaire.jpg"
              alt="Espace documentaire"
              width={264}
              height={256}
            />
          }
          className="h-auto"
        />
        <Tile
          small
          enlargeLinkOrButton
          linkProps={{
            href: "https://fabnummas.notion.site/Nouveaut-s-de-l-espace-professionnel-AAP-et-certificateurs-et-de-l-espace-candidat-France-VAE-42e539695d68436abe32fcf4b146c192",
            target: "_",
          }}
          detail="Mise à jour : 01/09/2025"
          imageAlt="Nouvelles fonctionnalités"
          imageUrl="/admin2/components/innovation.svg"
          title="Nouvelles fonctionnalités"
          desc="Vous trouverez ici les dernières évolutions de votre espace professionnel France VAE"
        />
      </div>
    </>
  );
};

export default async function CertificateurHelp() {
  const { questionsFrequentesSection } =
    await getCertificationAuthoritiesHelp();

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

      <BackButton href="/admin2">Retour</BackButton>
    </div>
  );
}
