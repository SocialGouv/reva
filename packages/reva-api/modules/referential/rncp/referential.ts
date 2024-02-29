import { logger } from "../../shared/logger";

const FRANCE_COMPENTENCES_API_KEY = process.env.FRANCE_COMPENTENCES_API_KEY;
const URL = "https://api.francecompetences.fr/referentiels/v2.0/fiches";

/*
const DEFAULT_CERTIFICATIONS = [
  "492",
  "1120",
  "28048",
  "32208",
  "34177",
  "34826",
  "35506",
  "35830",
  "35832",
  "36004",
  "36661",
  "36805",
  "36836",
  "37106",
  "37274",
  "37675",
  "37676",
  "37679",
  "37780",
  "38362",
];
*/

export type FindParams = {
  STATUT?: "ACTIF" | "INACTIF";
  INTITULE?: string;
  NUMERO_FICHE?: string;
};

export type RNCPCertification = {
  ID_FICHE: string;
  NUMERO_FICHE: string;
  BLOCS_COMPETENCES: {
    CODE: string;
    LIBELLE: string;
    LISTE_COMPETENCES: string;
    PARSED_COMPETENCES: string[];
    MODALITES_EVALUATION?: string;
  }[];
};

export class RNCPReferential {
  private static instance: RNCPReferential;

  private apiKey: string;

  private constructor() {
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
      const queryParams = Object.keys(params || {}).reduce((acc, key) => {
        const value = params?.[key as keyof FindParams];
        if (value != undefined) {
          return `${acc}&${key}=${value}`;
        }
        return acc;
      }, "");

      const url = `${URL}?REPERTOIRE=RNCP${queryParams}`;
      const response = await fetch(url, {
        headers: {
          "X-Gravitee-Api-Key": this.apiKey,
        },
      });

      const data = (await response.json()) as {
        nombreResultats: number;
        fiches: any[];
      };

      const certifications: RNCPCertification[] = data.fiches.reduce(
        (acc, value) => {
          const certification = mapToRNCPCertification(value);
          if (certification) {
            return [...acc, certification];
          }
          return acc;
        },
        [] as RNCPCertification[],
      );

      return {
        nombreResultats: data.nombreResultats,
        certifications,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
    }

    return {
      nombreResultats: 0,
      certifications: [],
    };
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

  // -
  const regEx6 = new RegExp(/(?:(- | - ))/g);
  if (cleanedValue.match(regEx6)) {
    let list: string[] = [];
    list = cleanedValue
      .replace(
        new RegExp(
          /^Compétences de niveau [0-9] du référentiel de compétences attendues ?/,
        ),
        "",
      )
      .split(regEx6)
      .filter((v) => v != "" && v != "- " && v != " - ");
    return list;
  }

  // Space + UpperFirst regEx
  const regExDefault = new RegExp(/(?= [A-ZÀ-Ö])/g);
  if (cleanedValue.match(regExDefault)) {
    let list: string[] = [];
    list = cleanedValue.split(regExDefault);
    list = list.map((v) => v.replace(new RegExp(/^ /), ""));
    return list;
  }

  return [];
}

function mapToRNCPCertification(data: any): RNCPCertification | undefined {
  try {
    const certification: RNCPCertification = {
      ID_FICHE: data.ID_FICHE,
      NUMERO_FICHE: data.NUMERO_FICHE,
      BLOCS_COMPETENCES: ((data.BLOCS_COMPETENCES || []) as any[]).map(
        (bloc) => {
          return {
            CODE: bloc.CODE,
            LIBELLE: bloc.LIBELLE,
            LISTE_COMPETENCES: bloc.LISTE_COMPETENCES,
            PARSED_COMPETENCES: splitString(
              (bloc.LISTE_COMPETENCES as string) || "",
            ),
            MODALITES_EVALUATION: bloc.MODALITES_EVALUATION,
          };
        },
      ),
    };

    return certification;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  return undefined;
}
