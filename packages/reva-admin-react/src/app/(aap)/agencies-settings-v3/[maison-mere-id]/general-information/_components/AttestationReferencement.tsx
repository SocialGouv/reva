import Button from "@codegouvfr/react-dsfr/Button";
import { addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";

import { GrayCard } from "@/components/card/gray-card/GrayCard";

const generateAttestationPDF = async ({
  raisonSociale,
  siret,
}: {
  raisonSociale: string;
  siret: string;
}) => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageMargin = 40;
    const contentWidth = pageWidth - 2 * pageMargin;
    const logoSize = 100;
    const logoHeight = 60;
    const francevaeLogoHeight = 40;

    pdf.addImage(
      "/admin2/logos/logo-gouv.png",
      "PNG",
      pageMargin,
      40,
      logoSize,
      logoHeight,
    );
    pdf.addImage(
      "/admin2/logos/logo-france-vae.png",
      "PNG",
      pageWidth - pageMargin - logoSize,
      40,
      logoSize,
      francevaeLogoHeight,
    );

    const titleY = 140;
    pdf.setFontSize(12);
    pdf.setFont("arial", "bold");
    pdf.text(
      "Attestation de référencement AAP sur France VAE",
      pageWidth / 2,
      titleY,
      { align: "center" },
    );

    const legalReferenceY = 170;
    pdf.setFontSize(8);
    pdf.setFont("arial", "normal");
    pdf.setTextColor(0, 0, 255);
    pdf.textWithLink(
      "Article R6412-2 - Code du travail",
      pageWidth / 2,
      legalReferenceY,
      {
        align: "center",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048700005",
      },
    );

    const decreeY = 185;
    const decreePrefix = "créé par ";
    const decreeText = "Décret n°2023-1275 du 27 décembre 2023 - art. 2";
    const totalWidth =
      pdf.getTextWidth(decreePrefix) + pdf.getTextWidth(decreeText);
    const decreeStartX = (pageWidth - totalWidth) / 2;

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(decreePrefix, decreeStartX, decreeY);

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 255);
    pdf.textWithLink(
      decreeText,
      decreeStartX + pdf.getTextWidth(decreePrefix),
      decreeY,
      {
        align: "left",
        url: "https://www.legifrance.gouv.fr/loda/id/LEGIARTI000048687412/2023-12-29/",
      },
    );

    const mainContentY = 250;
    const lineHeight = 14;
    const mainText = {
      prefix:
        "La présente attestation certifie que l'Architecte Accompagnateur de Parcours (AAP) ",
      entity: `${raisonSociale} - SIRET ${siret}`,
      suffix:
        " est référencé sur la plateforme France VAE  pour accompagner les personnes qui souhaitent s'engager dans un parcours de validation des acquis de l'expérience et bénéficier d'un accompagnement personnalisé, conformément aux dispositions réglementaires en vigueur, décrites dans les CGU de France VAE.",
    };

    const warningText =
      "Ce référencement pourra être suspendu ou retiré en cas de manquement avéré aux engagements mentionnés en CGU.";

    let currentY = mainContentY;
    let currentX = pageMargin;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    const words = (mainText.prefix + mainText.entity + mainText.suffix).split(
      " ",
    );

    words.forEach((word) => {
      const spaceWidth = pdf.getTextWidth(" ");
      const isEntityWord = mainText.entity.includes(word);
      pdf.setFont("arial", isEntityWord ? "bold" : "normal");

      const wordWidth = pdf.getTextWidth(word);

      if (currentX + wordWidth > pageWidth - pageMargin) {
        currentY += lineHeight;
        currentX = pageMargin;
      }

      pdf.text(word, currentX, currentY);
      currentX += wordWidth + spaceWidth;
    });

    currentY += lineHeight * 2;
    pdf.setFont("arial", "normal");
    pdf.text(warningText, pageMargin, currentY);

    const now = new Date();
    const currentDate = format(now, "d MMMM yyyy", { locale: fr });
    const expirationDate = format(addMonths(now, 3), "d MMMM yyyy", {
      locale: fr,
    });

    currentY += lineHeight * 3;
    const dateLabel = "Date de délivrance de l'attestation :";
    const dateLabelWidth = pdf.getTextWidth(dateLabel);
    pdf.text(dateLabel, pageMargin, currentY);

    pdf.setFont("arial", "bold");
    pdf.text(currentDate, pageMargin + dateLabelWidth + 4, currentY);

    currentY += lineHeight * 2;
    pdf.setFont("arial", "italic");
    pdf.setTextColor(128, 128, 128);
    const validityText = `La présente attestation est valable du ${currentDate} au ${expirationDate}, sous réserve de tout changement pouvant affecter le référencement.`;
    const validityLines = pdf.splitTextToSize(validityText, contentWidth);
    pdf.text(validityLines, pageMargin, currentY);

    pdf.save("attestation_de_referencement_france_vae.pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
};

export const AttestationReferencement = ({
  raisonSociale,
  siret,
  canDownloadAttestationReferencement,
}: {
  raisonSociale: string;
  siret: string;
  canDownloadAttestationReferencement: boolean;
}) => (
  <GrayCard className="mb-5 gap-4">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <i className="ri-file-download-fill" aria-hidden="true"></i>
        <h3 className="m-0">Attestation de référencement</h3>
      </div>
      <Button
        onClick={() => generateAttestationPDF({ raisonSociale, siret })}
        priority="secondary"
        disabled={!canDownloadAttestationReferencement}
        data-testid="download-attestation-referencement"
      >
        Générer le PDF
      </Button>
    </div>
    {!canDownloadAttestationReferencement && (
      <p
        className="pl-8 w-3/4 mb-0"
        data-testid="attestation-referencement-warning"
      >
        Vous ne pouvez pas générer d'attestation si votre compte n'est pas à
        jour ou si votre établissement a fermé.
      </p>
    )}
  </GrayCard>
);
