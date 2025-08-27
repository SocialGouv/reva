import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

import { PageLayout } from "@/layouts/page.layout";
import { getStrapiImageUrl } from "@/utils/getStrapiImageUrl.util";

import {
  getHelpPageItems,
  HelpPageItemsTutorielSection,
} from "./get-help-page-items";

const TutorielSection = async ({
  tutorielSection,
}: {
  tutorielSection: HelpPageItemsTutorielSection;
}) => {
  if (!tutorielSection) return null;

  return (
    <div className="mb-8">
      <h2>{tutorielSection.titre}</h2>
      <p>{tutorielSection.sous_titre}</p>
      <div className="flex gap-6 w-full">
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

export default async function HelpPage() {
  const { tutorielSection } = await getHelpPageItems();
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
      <Button priority="secondary" linkProps={{ href: "/candidat" }}>
        Retour
      </Button>
    </PageLayout>
  );
}
