import {
  CandidateTypology,
  DFFCertificationCompetenceDetailsState,
  DFFEligibilityCandidateSituation,
  DFFEligibilityRequirement,
  ExperienceDuration,
  Gender,
} from "@prisma/client";

const ASSETS_PATH =
  "modules/feasibility/dematerialized-feasibility-file/helpers/df-demat-pdf-helper/assets/";

export const addFrame = ({
  doc,
  content,
  startInPt,
  widthInPt,
}: {
  doc: PDFKit.PDFDocument;
  startInPt: number;
  widthInPt: number;
  content: (doc: PDFKit.PDFDocument) => void;
}) => {
  const yStart = doc.y;
  content(doc);
  doc.moveDown(1);
  const yEnd = doc.y;
  doc
    .rect(startInPt, yStart, widthInPt, yEnd - yStart)
    .strokeColor("#DDDDDD")
    .lineWidth(0.5)
    .stroke();
  doc.text("", startInPt, doc.y); //reset x position to start of frame after frame end
};

export const addTag = ({
  doc,
  text,
  startInPt,
}: {
  doc: PDFKit.PDFDocument;
  text: string;
  startInPt: number;
}) => {
  doc.fontSize(7).font("assets/fonts/Marianne/Marianne-Light.otf");
  doc
    .roundedRect(
      startInPt,
      doc.y,
      doc.widthOfString(text) + pxToPt(30),
      pxToPt(35),
      pxToPt(40),
    )
    .lineWidth(0.5)
    .strokeColor("#DDDDDD")
    .stroke();
  doc.text("  " + text, startInPt + pxToPt(5), doc.y + pxToPt(5));
};

export const addInfoText = ({
  title,
  value,
  x,
  y,
  maxWidthInPt,
  doc,
}: {
  title: string;
  value: string;
  x?: number;
  y?: number;
  maxWidthInPt?: number;
  doc: PDFKit.PDFDocument;
}) => {
  doc
    .font("assets/fonts/Marianne/Marianne-Light.otf")
    .fontSize(8)
    .table({
      defaultStyle: { border: false, padding: false },
      position: { x: x ?? doc.x, y: y ?? doc.y },
      maxWidth: maxWidthInPt ?? undefined,
      data: [
        [
          {
            text: title,
          },
        ],
        [
          {
            text: value,
            font: {
              src: "assets/fonts/Marianne/Marianne-Medium.otf",
            },
          },
        ],
      ],
    });
};

export const addCallout = ({
  doc,
  title,
  description,
  x,
  y,
  widthInPt,
}: {
  doc: PDFKit.PDFDocument;
  title: string;
  description: string;
  x?: number;
  y?: number;
  widthInPt?: number;
}) => {
  doc
    .font("assets/fonts/Marianne/Marianne-Regular.otf")
    .fontSize(9)
    .table({
      position: { x: x ?? doc.x, y: y ?? doc.y },
      maxWidth: widthInPt ?? undefined,
      defaultStyle: {
        border: [false, false, false, true],
        borderColor: "#6a6af4",
        backgroundColor: "#eeeeee",
      },
      data: [
        [
          {
            text: title,
            padding: {
              top: "16px",
              bottom: "2px",
              left: "24px",
              right: "24px",
            },
          },
        ],
        [
          {
            text: description,
            font: {
              src: "assets/fonts/Marianne/Marianne-Light.otf",
            },
            padding: { top: 0, bottom: "16px", left: "24px", right: "24px" },
          },
        ],
      ],
    });
};

export const addSection = ({
  title,
  iconPath,
  content,
  doc,
}: {
  title: string;
  iconPath: string;
  content: (doc: PDFKit.PDFDocument) => void;
  doc: PDFKit.PDFDocument;
}) => {
  const oldX = doc.x;
  doc.image(iconPath, doc.x + pxToPt(40), doc.y + pxToPt(8), {
    fit: [pxToPt(40), pxToPt(40)],
  });

  doc
    .fontSize(14)
    .font("assets/fonts/Marianne/Marianne-Bold.otf")
    .text(title, doc.x + pxToPt(90), doc.y);

  doc.moveDown(0.5);

  content(doc);

  doc.moveDown(5);
  doc.text("", oldX, doc.y); //reset x position to start of section after title
};

export const pxToPt = (pixels: number) => pixels / 2.48;

export const addSubSection = ({
  title,
  doc,
  content,
}: {
  title: string;
  content: (doc: PDFKit.PDFDocument) => void;
  doc: PDFKit.PDFDocument;
}) => {
  const oldX = doc.x;
  doc
    .fontSize(12)
    .font("assets/fonts/Marianne/Marianne-Bold.otf")
    .text(title, pxToPt(140));
  doc.moveDown(0.5);
  doc.text("", doc.x + pxToPt(40), doc.y); //indent content
  content(doc);
  doc.moveDown(0.5);
  doc.text("", oldX, doc.y); //reset x position to start of block after sub section end
};

export const getEligibilityLabelAndType = ({
  eligibilityRequirement,
  eligibilitySituation,
}: {
  eligibilityRequirement?: DFFEligibilityRequirement | null;
  eligibilitySituation?: DFFEligibilityCandidateSituation | null;
}): { label: string; type: "info" | "warning" } => {
  if (eligibilitySituation) {
    switch (eligibilitySituation) {
      case DFFEligibilityCandidateSituation.PREMIERE_DEMANDE_RECEVABILITE:
        return {
          label: "PREMIÈRE DEMANDE DE RECEVABILITÉ",
          type: "info",
        };
      case DFFEligibilityCandidateSituation.DETENTEUR_RECEVABILITE:
        return {
          label: "DÉTENTEUR DE RECEVABILITÉ",
          type: "info",
        };
      case DFFEligibilityCandidateSituation.DETENTEUR_RECEVABILITE_AVEC_CHGT_CODE_RNCP_ET_REV_REFERENTIEL:
        return {
          label:
            "DÉTENTEUR DE RECEVABILITÉ AVEC CHANGEMENT DE CODE RNCP ET RÉVISION DU RÉFÉRENTIEL",
          type: "info",
        };
      case DFFEligibilityCandidateSituation.DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL:
        return {
          label:
            "DÉTENTEUR DE RECEVABILITÉ AVEC RÉVISION SANS CHANGEMENT DE RÉFÉRENTIEL",
          type: "info",
        };
    }
  }

  switch (eligibilityRequirement) {
    case DFFEligibilityRequirement.FULL_ELIGIBILITY_REQUIREMENT:
      return {
        label: "ACCÈS AU DOSSIER DE FAISABILITÉ INTÉGRAL",
        type: "info",
      };
    case DFFEligibilityRequirement.PARTIAL_ELIGIBILITY_REQUIREMENT:
      return {
        label: "ACCÈS AU DOSSIER DE FAISABILITÉ ADAPTÉ",
        type: "warning",
      };
  }

  return {
    label: "Inconnu",
    type: "warning",
  };
};

export const addTitledBlock = ({
  title,
  content,
  startInPt,
  doc,
}: {
  title: string;
  content: (doc: PDFKit.PDFDocument) => void;
  startInPt?: number;
  widthInPt: number;
  doc: PDFKit.PDFDocument;
}) => {
  const oldX = doc.x;
  doc
    .fontSize(8)
    .font("assets/fonts/Marianne/Marianne-Medium.otf")
    .text(title, startInPt, doc.y);
  doc.moveDown(0.5);
  doc
    .text("", startInPt ?? doc.x + pxToPt(16), doc.y)
    .font("assets/fonts/Marianne/Marianne-Regular.otf");
  content(doc);
  doc.text("", oldX, doc.y); //reset x position to start of block after block end
};

export const addDisabledCheckbox = ({
  label,
  checked,
  doc,
}: {
  label: string;
  checked: boolean;
  doc: PDFKit.PDFDocument;
}) => {
  const oldX = doc.x;
  if (checked) {
    doc.image(
      `${ASSETS_PATH}/images/checkbox-disabled-checked.png`,
      doc.x,
      doc.y + 1.5,
      {
        fit: [pxToPt(24), pxToPt(24)],
      },
    );
  } else {
    doc.image(
      `${ASSETS_PATH}/images/checkbox-disabled-unchecked.png`,
      doc.x,
      doc.y + 1.5,
      {
        fit: [pxToPt(24), pxToPt(24)],
      },
    );
  }
  doc
    .fontSize(8)
    .font("assets/fonts/Marianne/Marianne-Light.otf")
    .text(label, doc.x + pxToPt(30), doc.y);
  doc.text("", oldX, doc.y); //reset x position to start of checkbox after checkbox end
};

export const addDocumentHeader = (doc: PDFKit.PDFDocument) => {
  doc.image(
    `${ASSETS_PATH}/images/republique-francaise.png`,
    doc.x - 10,
    doc.y,
    {
      fit: [104.25, 90.75],
    },
  );

  doc.image(`${ASSETS_PATH}/images/france-vae.png`, doc.x + 395, doc.y + 6, {
    fit: [155.25, 69.9],
  });

  doc.moveDown(10);
};

export const addInfoTable = ({
  doc,
  data,
  widthInPt,
}: {
  doc: PDFKit.PDFDocument;
  data: { title: string; value: string }[];
  widthInPt: number;
}) => {
  const oldX = doc.x;
  data.forEach((item) => {
    const lineY = doc.y;
    doc
      .fontSize(8)
      .font("assets/fonts/Marianne/Marianne-Light.otf")
      .text(item.title, doc.x, doc.y);
    doc.text("", doc.x, lineY);
    doc
      .fontSize(8)
      .font("assets/fonts/Marianne/Marianne-Regular.otf")
      .text(
        item.value,
        595 - pxToPt(140) - doc.widthOfString(item.value),
        doc.y,
      );
    doc.text("", oldX, lineY + pxToPt(40));
    doc
      .moveTo(doc.x, doc.y)
      .lineWidth(0.5)
      .strokeColor("#DDDDDD")
      .lineTo(doc.x + widthInPt, doc.y)
      .stroke();
    doc.moveDown(0.3);
  });
  doc.text("", oldX); //reset x position to start of table after table end
};

export const addCompetence = ({
  doc,
  label,
  state,
}: {
  doc: PDFKit.PDFDocument;
  label: string;
  state: DFFCertificationCompetenceDetailsState | "TO_COMPLETE";
}) => {
  switch (state) {
    case "YES":
      doc
        .font("assets/fonts/Marianne/Marianne-Bold.otf")
        .fontSize(7)
        .table({
          columnStyles: [22],
          data: [
            [
              {
                border: 0,
                backgroundColor: "#b8fec9",
                textColor: "#18753c",
                text: "OUI",
                align: "center",
              },
            ],
          ],
        });
      break;
    case "NO":
      doc
        .font("assets/fonts/Marianne/Marianne-Bold.otf")
        .fontSize(7)
        .table({
          position: { x: doc.x, y: doc.y + 20 },
          columnStyles: [26],
          data: [
            [
              {
                border: 0,
                backgroundColor: "#ffe9e9",
                textColor: "#ce0500",
                text: "NON",
                align: "center",
              },
            ],
          ],
        });
      break;
    case "PARTIALLY":
      doc
        .font("assets/fonts/Marianne/Marianne-Bold.otf")
        .fontSize(7)
        .table({
          position: { x: doc.x, y: doc.y + 20 },
          columnStyles: [67],
          data: [
            [
              {
                border: 0,
                backgroundColor: "#feebd0",
                textColor: "#695240",
                text: "PARTIELLEMENT",
                align: "center",
              },
            ],
          ],
        });
      break;
    case "TO_COMPLETE":
      doc
        .font("assets/fonts/Marianne/Marianne-Bold.otf")
        .fontSize(7)
        .table({
          position: { x: doc.x, y: doc.y + 20 },
          columnStyles: [60],
          data: [
            [
              {
                border: 0,
                backgroundColor: "#ffe9e6",
                textColor: "#b34000",
                text: "À COMPLÉTER",
                align: "center",
              },
            ],
          ],
        });
      break;
  }

  doc.moveDown(0.1);

  doc
    .font("assets/fonts/Marianne/Marianne-Regular.otf")
    .fontSize(8)
    .text(label.replace(/(\r\n|\n|\r)/gm, ""), doc.x, doc.y);
};

export const getCourtesyTitleFromGender = (gender: Gender | null) => {
  switch (gender) {
    case "man":
      return "Monsieur";
    case "woman":
      return "Madame";
    default:
      return "";
  }
};

export const getCandidateTypologyLabel = (typology: CandidateTypology) => {
  switch (typology) {
    case "NON_SPECIFIE":
      return "Non spécifié";
    case "SALARIE_PRIVE":
      return "Salarié du secteur privé";
    case "BENEVOLE":
      return "Bénévole";
    case "AIDANTS_FAMILIAUX":
      return "Aidant familial";
    case "AIDANTS_FAMILIAUX_AGRICOLES":
      return "Aidant familial agricole";
    case "DEMANDEUR_EMPLOI":
      return "Demandeur d'emploi";
    case "TRAVAILLEUR_NON_SALARIE":
      return "Travailleur non salarié";
    case "RETRAITE":
      return "Retraité";
    case "TITULAIRE_MANDAT_ELECTIF":
      return "Titulaire d’un mandat électif";
    case "CONJOINT_COLLABORATEUR":
      return "Conjoint collaborateur";
    case "STAGIAIRE":
      return "Stagiaire";
    case "SALARIE_PUBLIC":
      return "Salarié du secteur public";
    case "SALARIE_PUBLIC_HOSPITALIER":
      return "Salarié public hospitalier";
    case "SALARIE_ALTERNANT":
      return "Salarié alternant";
    case "SALARIE_INTERIMAIRE":
      return "Salarié interimaire";
    case "SALARIE_INTERMITTENT":
      return "Salarié intermittent";
    case "SALARIE_EN_CONTRATS_AIDES":
      return "Salarié en contrats d'aides";
    case "AUTRE":
      return "Autre";
    default:
      return typology;
  }
};

export const getExperienceDurationLabel = (duration: ExperienceDuration) => {
  switch (duration) {
    case "lessThanOneYear":
      return "Expérience de moins de 1 an";
    case "betweenOneAndThreeYears":
      return "Expérience entre 1 et 3 ans";
    case "moreThanThreeYears":
      return "Expérience de plus de 3 ans";
    case "moreThanFiveYears":
      return "Expérience de plus de 5 ans";
    case "moreThanTenYears":
      return "Expérience de plus de 10 ans";
    default:
      return "Expérience de durée inconnue";
  }
};
