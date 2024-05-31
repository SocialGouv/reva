import { isAfter } from "date-fns";

import { logger } from "../../shared/logger";

const ENTREPRISE_GOUV_API_TOKEN = process.env.ENTREPRISE_GOUV_API_TOKEN;
const URL = "https://entreprise.api.gouv.fr/v3";

export type EtablissemntFindParams = {
  siret: string;
};

export type Etablissement = {
  siret: string;
  siege_social: boolean;
  date_fermeture: Date | null;
  raison_sociale: string;
  forme_juridique: string;
};

export class EntrepriseReferential {
  private static instance: EntrepriseReferential;

  private apiToken: string;

  private constructor() {
    if (!ENTREPRISE_GOUV_API_TOKEN) {
      const error = `"ENTREPRISE_GOUV_API_TOKEN" has not been set`;
      console.error(error);
      logger.error(error);

      throw new Error(error);
    }

    this.apiToken = ENTREPRISE_GOUV_API_TOKEN;
  }

  public static getInstance(): EntrepriseReferential {
    if (!EntrepriseReferential.instance) {
      EntrepriseReferential.instance = new EntrepriseReferential();
    }

    return EntrepriseReferential.instance;
  }

  async findEtablissement(
    params: EtablissemntFindParams,
  ): Promise<Etablissement | null> {
    try {
      const url = `${URL}/insee/sirene/etablissements/diffusibles/${params.siret}?${this.getParameters().toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      const data = (await response.json()) as {
        data: any;
      };

      const etablissement: Etablissement | null = data?.data
        ? mapDataToEtablissement(data.data)
        : null;

      return etablissement;
    } catch (error) {
      console.error(error);
      logger.error(error);
    }

    return null;
  }

  async findQualiopiStatus(
    params: EtablissemntFindParams,
  ): Promise<boolean | null> {
    try {
      const url = `${URL}/carif_oref/etablissements/${params.siret}/certifications_qualiopi_france_competences?${this.getParameters().toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      const data = (await response.json()) as {
        data: any;
      };

      const status = data.data.declarations_activites_etablissement?.sort(
        (
          a: { date_derniere_declaration: string },
          b: { date_derniere_declaration: string },
        ) =>
          isAfter(a.date_derniere_declaration, b.date_derniere_declaration)
            ? -1
            : 1,
      )?.[0]?.certification_qualiopi?.validation_acquis_experience;

      const booleanStatus =
        status == null || status == undefined ? null : status;

      return booleanStatus;
    } catch (error) {
      console.error(error);
      logger.error(error);
    }

    return null;
  }

  private getParameters(): URLSearchParams {
    const parameters: {
      context: string;
      object: string;
      recipient: string;
    } = {
      context: "“Inscription d’un professionnel sur France VAE”",
      object: `“Test en ${process.env.NODE_ENV}” /  “Vérification si siège social et actif, affichage résumé” / “Vérification si certification Qualiopi VAE”`,
      recipient: "13002526500013",
    };

    const queryParams = new URLSearchParams(parameters);

    return queryParams;
  }
}

function mapDataToEtablissement(data: any): Etablissement | null {
  try {
    const etablissement: Etablissement = {
      siret: data.siret,
      siege_social: data.siege_social,
      date_fermeture: data.date_fermeture
        ? new Date(data.date_fermeture)
        : null,
      raison_sociale:
        data.unite_legale?.forme_juridique?.code == "1000"
          ? `${data.unite_legale?.personne_physique_attributs?.prenom_usuel || data.unite_legale?.personne_physique_attributs?.prenom_1 || ""} ${data.unite_legale?.personne_physique_attributs?.nom_usage || data.unite_legale?.personne_physique_attributs?.nom_naissance || ""}`
          : data.unite_legale?.personne_morale_attributs?.raison_sociale,
      forme_juridique: data.unite_legale?.forme_juridique?.libelle || "",
    };

    return etablissement;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  return null;
}
