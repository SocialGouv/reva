import { GrayCard } from "@/components/card/gray-card/GrayCard";
import Button from "@codegouvfr/react-dsfr/Button";
import { addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";

const generatePDF = async ({
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
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;

    pdf.addImage("/admin2/logos/logo-gouv.png", "PNG", margin, 40, 100, 60);
    pdf.addImage(
      "/admin2/logos/logo-france-vae.png",
      "PNG",
      pageWidth - margin - 100,
      40,
      100,
      40,
    );

    pdf.setFontSize(16);
    pdf.setFont("arial", "bold");
    pdf.text(
      "Attestation de référencement sur France VAE",
      pageWidth / 2,
      140,
      { align: "center" },
    );

    pdf.setFontSize(10);
    pdf.setFont("arial", "normal");
    pdf.setTextColor(0, 0, 255);
    pdf.textWithLink("Article R6412-2 - Code du travail", pageWidth / 2, 170, {
      align: "center",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048700005",
    });

    const createdByText = "créé par";
    const decreeText = "Décret n°2023-1275 du 27 décembre 2023 - art. 2";
    const totalWidth =
      pdf.getTextWidth(createdByText) + pdf.getTextWidth(decreeText);
    const startX = (pageWidth - totalWidth) / 2;

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(createdByText, startX, 185);

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 255);
    pdf.textWithLink(
      decreeText,
      startX + pdf.getTextWidth(createdByText),
      185,
      {
        align: "left",
        url: "https://www.legifrance.gouv.fr/loda/id/LEGIARTI000048687412/2023-12-29/",
      },
    );

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    const prefix = "La présente attestation certifie que ";
    const boldText = `${raisonSociale} - SIRET ${siret} `;
    const suffix =
      " est référencé sur la plateforme France VAE selon les modalités définies réglementairement, pour accompagner les personnes qui souhaitent s'engager dans un parcours de validation des acquis de l'expérience et bénéficier d'un accompagnement personnalisé.";

    const lineHeight = 14;
    const startY = 250;
    let currentY = startY;

    pdf.setFont("arial", "normal");
    const prefixWidth = pdf.getTextWidth(prefix);
    pdf.text(prefix, margin, currentY);

    pdf.setFont("arial", "bold");
    pdf.text(boldText, margin + prefixWidth, currentY);

    const firstLineWidth = prefixWidth + pdf.getTextWidth(boldText);
    const remainingWidth = contentWidth - firstLineWidth;

    pdf.setFont("arial", "normal");
    const firstWordSpace = pdf.getTextWidth(" ");

    if (remainingWidth > firstWordSpace) {
      const fittingText = pdf.splitTextToSize(suffix, remainingWidth)[0];
      pdf.text(fittingText, margin + firstLineWidth, currentY);

      const remainingSuffix = suffix.substring(fittingText.length);
      if (remainingSuffix) {
        const remainingLines = pdf.splitTextToSize(
          remainingSuffix.trim(),
          contentWidth,
        );
        remainingLines.forEach((line: string) => {
          currentY += lineHeight;
          pdf.text(line, margin, currentY);
        });
      }
    } else {
      const suffixLines = pdf.splitTextToSize(suffix.trim(), contentWidth);
      suffixLines.forEach((line: string) => {
        currentY += lineHeight;
        pdf.text(line, margin, currentY);
      });
    }

    const now = new Date();
    const currentDate = format(now, "d MMMM yyyy", { locale: fr });
    const futureDate = format(addMonths(now, 3), "d MMMM yyyy", { locale: fr });

    pdf.setTextColor(0, 0, 0);
    pdf.setFont("arial", "normal");
    const dateLabel = "Date de délivrance de l'attestation :";
    const dateLabelWidth = pdf.getTextWidth(dateLabel);
    pdf.text(dateLabel, margin, 320);

    pdf.setFont("arial", "bold");
    pdf.text(currentDate, margin + dateLabelWidth + 4, 320);

    pdf.setFont("arial", "italic");
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `La présente attestation est valable du ${currentDate} au ${futureDate}`,
      margin,
      340,
    );

    pdf.setFont("arial", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text("France VAE", margin, 380);

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
        onClick={() => generatePDF({ raisonSociale, siret })}
        priority="secondary"
        disabled={!canDownloadAttestationReferencement}
      >
        Générer le PDF
      </Button>
    </div>
    {!canDownloadAttestationReferencement && (
      <p className="pl-8 w-3/4 mb-0">
        Vous ne pouvez pas générer d'attestation si votre compte n'est pas à
        jour ou si votre établissement a fermé.
      </p>
    )}
  </GrayCard>
);
