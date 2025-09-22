import { parse } from "date-fns";

import { logger } from "@/modules/shared/logger/logger";

const URL = "https://api.francecompetences.fr/referentiels/v2.0/fiches";

type FindParams = {
  STATUT?: "ACTIF" | "INACTIF";
  INTITULE?: string;
  NUMERO_FICHE?: string;
};

export type RNCPCertification = {
  ID_FICHE: string;
  NUMERO_FICHE: string;
  INTITULE: string;
  ABREGE?: {
    CODE: string;
    LIBELLE: string;
  };
  NOMENCLATURE_EUROPE?: {
    NIVEAU: string;
    INTITULE: string;
  };
  DATE_FIN_ENREGISTREMENT?: number;
  DATE_LIMITE_DELIVRANCE?: number;
  DATE_EFFET?: number;
  DATE_DE_PUBLICATION?: number;
  BLOCS_COMPETENCES: {
    CODE: string;
    LIBELLE: string;
    LISTE_COMPETENCES: string;
    PARSED_COMPETENCES: string[];
    MODALITES_EVALUATION?: string;
  }[];
  FORMACODES: {
    CODE: string;
    LIBELLE: string;
  }[];
  PREREQUIS: { LISTE_PREREQUIS: string; PARSED_PREREQUIS: string[] };
  OBJECTIFS_CONTEXTE?: string;
};

export class RNCPReferential {
  private static instance: RNCPReferential;

  private apiKey: string;

  private constructor() {
    const FRANCE_COMPENTENCES_API_KEY = process.env.FRANCE_COMPENTENCES_API_KEY;

    if (!FRANCE_COMPENTENCES_API_KEY) {
      const error = `"FRANCE_COMPENTENCES_API_KEY" has not been set`;
      console.error(error);
      logger.error(error);

      throw new Error(error);
    }

    this.apiKey = FRANCE_COMPENTENCES_API_KEY;
  }

  public static getInstance(): RNCPReferential {
    if (!RNCPReferential.instance) {
      RNCPReferential.instance = new RNCPReferential();
    }

    return RNCPReferential.instance;
  }

  async find(params?: FindParams): Promise<{
    nombreResultats: number;
    certifications: RNCPCertification[];
  }> {
    try {
      const queryParams = new URLSearchParams(params || {});

      const url = `${URL}?REPERTOIRE=RNCP&${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          "X-Gravitee-Api-Key": this.apiKey,
        },
      });

      const data = (await response.json()) as {
        nombreResultats: number;
        fiches: any[];
      };

      const certifications: RNCPCertification[] = data.fiches.map(
        mapToRNCPCertification,
      );

      return {
        nombreResultats: data.nombreResultats,
        certifications,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);

      throw new Error(
        `L'API France compétences ne semble pas être disponible. Veuillez réessayer ultérieurement.`,
      );
    }
  }

  async findOneByRncp(rncp: string): Promise<RNCPCertification | undefined> {
    const formattedRNCP = `RNCP${rncp}`;
    const result = await this.find({ NUMERO_FICHE: formattedRNCP });
    const certification = result.certifications.find(
      (certification) => certification.NUMERO_FICHE == formattedRNCP,
    );
    return certification;
  }
}

function splitString(value: string): string[] {
  const cleanedValue = value.replace(
    new RegExp(/(BLOC DE COMPETENCES)( [0-9][A-Z] ?)/),
    "",
  );

  // Jump line + UpperFirst regEx
  const regExJumpline_R = new RegExp(/(?=\r\n\r\n)/g);
  if (cleanedValue.match(regExJumpline_R)) {
    let list: string[] = [];
    list = cleanedValue.split(regExJumpline_R);
    list = list.map((v) => v.replace(new RegExp(/^\r\n\r\n/), ""));
    return list;
  }

  // Jump line + UpperFirst regEx
  const regExJumpline_N = new RegExp(/(?=\n)/g);
  if (cleanedValue.match(regExJumpline_N)) {
    let list: string[] = [];
    list = cleanedValue.split(regExJumpline_N);
    list = list.map((v) => v.replace(new RegExp(/^\n/), ""));
    return list;
  }

  // Space + UpperFirst regEx
  const regEx1 = new RegExp(/( \* |\* )/g);
  if (cleanedValue.match(regEx1)) {
    let list: string[] = [];
    list = cleanedValue.split(regEx1);
    list = list
      .filter((v) => v != "" && v != "* " && v != " * ")
      .map((v) => v.replace(new RegExp(/ ;|\.$/g), ""));
    return list;
  }

  // UpperFirst + number.number. etc and -
  const regEx2 = new RegExp(/(?=(?:\b[A-Z]{1,2}\.? ?)(?:[^ –]*)(?: –))/g);
  if (cleanedValue.match(regEx2)) {
    let list: string[] = [];
    list = cleanedValue.split(regEx2);
    return list;
  }

  // UpperFirst + number.number. etc
  const regEx3 = new RegExp(
    /(?=(?:[A-Z]{1}[0-9]{1}\.(?:[A-Z][0-9]|[0-9][A-Z]|[0-9])))/g,
  );
  if (cleanedValue.match(regEx3)) {
    let list: string[] = [];
    list = cleanedValue.split(regEx3);
    return list;
  }

  // number + bis? + -
  const regEx4 = new RegExp(
    /(?=(?:\b[0-9]|[0-9]bis|[1-9][0-9]|[1-9][0-9]bis\b)(?: ?(?:-|–)))/g,
  );
  if (cleanedValue.match(regEx4)) {
    let list: string[] = [];
    list = cleanedValue.split(regEx4);
    return list;
  }

  // number + .
  const regEx5 = new RegExp(/(?=(?:\b[0-9]|[1-9][0-9]\b)(?:\. ))/g);
  if (cleanedValue.match(regEx5)) {
    let list: string[] = [];
    list = cleanedValue.split(regEx5);
    return list;
  }

  // ;
  const regEx6 = new RegExp(/(?:(; | ; ))/g);
  if (cleanedValue.match(regEx6)) {
    let list: string[] = [];
    list = cleanedValue
      .split(regEx6)
      .filter((v) => v != "" && v != "; " && v != " ; ");
    return list;
  }

  // -
  const regEx7 = new RegExp(/(?:(- | - ))/g);
  if (cleanedValue.match(regEx7)) {
    let list: string[] = [];
    list = cleanedValue
      .replace(
        new RegExp(
          /^Compétences de niveau [0-9] du référentiel de compétences attendues ?/,
        ),
        "",
      )
      .split(regEx7)
      .filter((v) => v != "" && v != "- " && v != " - ");
    return list;
  }

  // Space + UpperFirst regEx
  const regExSpaceUpperFirst = new RegExp(/(?= [A-ZÀ-Ö])/g);
  if (cleanedValue.match(regExSpaceUpperFirst)) {
    let list: string[] = [];
    list = cleanedValue.split(regExSpaceUpperFirst);
    list = list.map((v) => v.replace(new RegExp(/^ /), ""));
    return list;
  }

  return [];
}

function mapToRNCPCertification(data: any): RNCPCertification {
  try {
    const certification: RNCPCertification = {
      ID_FICHE: data.ID_FICHE,
      NUMERO_FICHE: data.NUMERO_FICHE,
      INTITULE: data.INTITULE,
      ABREGE: data.ABREGE
        ? {
            CODE: data.ABREGE.CODE,
            LIBELLE: data.ABREGE.LIBELLE,
          }
        : undefined,
      NOMENCLATURE_EUROPE: data.NOMENCLATURE_EUROPE
        ? {
            NIVEAU: data.NOMENCLATURE_EUROPE.NIVEAU,
            INTITULE: data.NOMENCLATURE_EUROPE.INTITULE,
          }
        : undefined,
      DATE_FIN_ENREGISTREMENT: data.DATE_FIN_ENREGISTREMENT
        ? getDateFromString(data.DATE_FIN_ENREGISTREMENT)
        : undefined,
      DATE_LIMITE_DELIVRANCE: data.DATE_LIMITE_DELIVRANCE
        ? getDateFromString(data.DATE_LIMITE_DELIVRANCE)
        : undefined,
      DATE_EFFET: data.DATE_EFFET
        ? getDateFromString(data.DATE_EFFET)
        : undefined,
      DATE_DE_PUBLICATION: data.DATE_DE_PUBLICATION
        ? getDateFromString(data.DATE_DE_PUBLICATION)
        : undefined,
      BLOCS_COMPETENCES: ((data.BLOCS_COMPETENCES || []) as any[])
        .map((bloc) => {
          return {
            CODE: bloc.CODE,
            LIBELLE: bloc.LIBELLE,
            LISTE_COMPETENCES: bloc.LISTE_COMPETENCES,
            PARSED_COMPETENCES: splitString(
              (bloc.LISTE_COMPETENCES as string) || "",
            ),
            MODALITES_EVALUATION: bloc.MODALITES_EVALUATION,
          };
        })
        .sort((a, b) => (a.CODE > b.CODE ? 1 : -1)),
      FORMACODES: ((data.FORMACODES || []) as any[]).map((formacode) => {
        return {
          CODE: formacode.CODE,
          LIBELLE: formacode.LIBELLE,
        };
      }),
      PREREQUIS: {
        LISTE_PREREQUIS: data.PREREQUIS_VALIDATION_CERTIFICATION,
        PARSED_PREREQUIS: splitString(
          (data.PREREQUIS_VALIDATION_CERTIFICATION as string) || "",
        ),
      },
      OBJECTIFS_CONTEXTE: data.OBJECTIFS_CONTEXTE
        ? data.OBJECTIFS_CONTEXTE
        : undefined,
    };

    return certification;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  throw new Error(
    `La certification avec le code rncp ${data?.NUMERO_FICHE} n'a pas pu être parsée. Veuillez contacter le support technique.`,
  );
}

function getDateFromString(value: string): number {
  return parse(value, "dd/MM/yyyy", new Date()).getTime();
}
