import { isAfter } from "date-fns";

import { logger } from "@/modules/shared/logger/logger";

const URL = "https://entreprise.api.gouv.fr/v3";

type EtablissemntFindParams = {
  siret: string;
};

type FormeJuridique = {
  code: string;
  libelle: string;
  legalStatus: LegalStatus;
};

type PersonneType = "PERSONNE_PHYSIQUE" | "PERSONNE_MORALE";

type MandataireSocial = {
  type: PersonneType;
  nom: string;
  fonction: string;
};

type Kbis = {
  mandatairesSociaux: MandataireSocial[];
  formeJuridique: string;
};

type Etablissement = {
  siret: string;
  siegeSocial: boolean;
  dateFermeture: Date | null;
  raisonSociale: string;
  formeJuridique: FormeJuridique;
};

function headers() {
  const token = process.env.ENTREPRISE_GOUV_API_TOKEN;
  if (!token) {
    const error = `"ENTREPRISE_GOUV_API_TOKEN" has not been set`;
    console.error(error);
    logger.error(error);

    throw new Error(error);
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function findEtablissementDiffusible(
  params: EtablissemntFindParams,
): Promise<Etablissement | null> {
  try {
    const url = `${URL}/insee/sirene/etablissements/diffusibles/${params.siret}?${getParameters().toString()}`;
    const response = await fetch(url, { headers: headers() });

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

export async function findEtablissement(
  params: EtablissemntFindParams,
): Promise<Etablissement | null> {
  try {
    const url = `${URL}/insee/sirene/etablissements/${params.siret}?${getParameters().toString()}`;

    const response = await fetch(url, { headers: headers() });

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

export async function findKbis(
  params: EtablissemntFindParams,
): Promise<Kbis | null> {
  try {
    const siren = params.siret.slice(0, 9);
    const url = `${URL}/infogreffe/rcs/unites_legales/${siren}/extrait_kbis?${getParameters().toString()}`;
    const response = await fetch(url, { headers: headers() });

    const data = (await response.json()) as {
      data: any;
    };

    return data?.data ? mapDataToKbis(data.data) : null;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  return null;
}

export async function findQualiopiStatus(
  params: EtablissemntFindParams,
): Promise<boolean | null> {
  try {
    const url = `${URL}/carif_oref/etablissements/${params.siret}/certifications_qualiopi_france_competences?${getParameters().toString()}`;
    const response = await fetch(url, { headers: headers() });

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

    const booleanStatus = status == null || status == undefined ? null : status;

    return booleanStatus;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  return null;
}

function getParameters(): URLSearchParams {
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

function mapDataToEtablissement(data: any): Etablissement | null {
  try {
    const etablissement: Etablissement = {
      siret: data.siret,
      siegeSocial: data.siege_social,
      dateFermeture: data.date_fermeture ? new Date(data.date_fermeture) : null,
      raisonSociale:
        data.unite_legale?.forme_juridique?.code == "1000"
          ? `${data.unite_legale?.personne_physique_attributs?.prenom_usuel || data.unite_legale?.personne_physique_attributs?.prenom_1 || ""} ${data.unite_legale?.personne_physique_attributs?.nom_usage || data.unite_legale?.personne_physique_attributs?.nom_naissance || ""}`
          : data.unite_legale?.personne_morale_attributs?.raison_sociale,
      formeJuridique: {
        code: data.unite_legale?.forme_juridique?.code || "",
        libelle: data.unite_legale?.forme_juridique?.libelle || "",
        legalStatus: getLegalStatus(data.unite_legale?.forme_juridique?.code),
      },
    };

    return etablissement;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  return null;
}

function mapDataToPersonneType(personne: string): PersonneType {
  if (personne == "personne_physique") {
    return "PERSONNE_PHYSIQUE";
  }

  if (personne == "personne_morale") {
    return "PERSONNE_MORALE";
  }

  throw new Error("Le type de personne retournée par l'API est inconnu");
}

function mapDataToMandataire(data: any): MandataireSocial {
  const type = mapDataToPersonneType(data.type);

  const nom =
    type == "PERSONNE_PHYSIQUE"
      ? `${data.prenom} ${data.nom}`
      : `${data.raison_sociale} (${data.numero_identification})`;

  return { type, nom, fonction: data.fonction };
}

function mapDataToKbis(data: any): Kbis | null {
  try {
    const kbis: Kbis = {
      mandatairesSociaux: data.mandataires_sociaux.map(mapDataToMandataire),
      formeJuridique: data.personne_morale?.forme_juridique?.valeur,
    };

    return kbis;
  } catch (error) {
    console.error(error);
    logger.error(error);
  }

  return null;
}

function getLegalStatus(code?: string): LegalStatus {
  if (code == "1000") {
    return "EI"; // OR "EIRL"
  } else if (code?.startsWith("54")) {
    return "SARL"; // OR "EURL"
  } else if (code?.startsWith("57")) {
    return "SAS"; // OR "SASU"
  } else if (code?.startsWith("55") || code?.startsWith("56")) {
    return "SA";
  } else if (code?.startsWith("92")) {
    return "ASSOCIATION_LOI_1901";
  } else if (
    code?.startsWith("71") ||
    code?.startsWith("72") ||
    code?.startsWith("73") ||
    code?.startsWith("74")
  ) {
    return "ETABLISSEMENT_PUBLIC";
  } else if (code == "9300") {
    return "FONDATION";
  } else if (code) {
    return "AUTRE";
  }

  return "NC";
}
