export interface RegionPageContent {
  title: string;
  slug: string;
  logoUrl: string;
  articles: RegionPageArticle[];
  prcs: PRC[];
}

export interface RegionPageArticle {
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string;
  content: string;
}

export interface PRC {
  name: string;
  department: string;
  address: string;
  phone: string;
  email: string;
}

export const regionPageContents: RegionPageContent[] = [
  {
    title: "La VAE en Normandie",
    slug: "normandie",
    logoUrl: "/regions/normandie/logo.png",
    articles: [
      {
        title:
          "La Région Normandie et son Agence de l’Orientation et des Métiers",
        slug: "article-1",
        thumbnailUrl: "/regions/normandie/articles/article-1/thumbnail.png",
        summary:
          "La Région Normandie et son Agence de l’Orientation et des Métiers sont engagées auprès des publics qui souhaitent valider une expérience à travers une Validation des Acquis de l’Expérience (VAE).",
        content: `
          <p>
          Vous souhaitez vous informer sur la VAE en Normandie ? Contactez un Point
          Relais Conseil qui vous aidera et vous conseillera sur les démarches, les
          procédures et vous guidera vers la certification qui correspond le mieux à
          votre profil et votre projet professionnel.
          </p>
          <p>
            <a href="/regions/normandie/conseillers"
              >Découvrir les Points Relais Conseil (PRC)</a
            >
          </p>
          <ul class="flex flex-col gap-4 mb-4">
            <li>
              <strong
                >Si votre certification est proposée dans le site France VAE,</strong
              >
              suivez les démarches qui sont proposées en ligne.
            </li>
            <li>
              <strong
                >Si votre certification n’est pas proposée sur le site France VAE,</strong
              >
              vous pouvez contacter un certificateur en Normandie qui traitera votre
              demande de VAE.
            </li>
          </ul>
          <p>
            <a
              target="_blank"
              href="https://parcours-metier.normandie.fr/vae-les-certificateurs-en-region"
              >Consultez la liste des certificateurs en Normandie.</a
            >
          </p>
          <p>
            En Normandie, La Région Normandie et France Travail ont passé un accord de
            partenariat qui vise à garantir un financement à tout candidat à la VAE
            demandeur d’emploi.
          </p>
          <p>
            Pour en savoir plus, consultez la rubrique
            <a
              target="_blank"
              href="https://parcours-metier.normandie.fr/vae-financement-pour-les-demandeurs-demploi"
              >“Financement pour les demandeurs d'emploi | Des parcours, un métier -
              Région Normandie”</a
            >.
          </p>
        `,
      },
    ],
    prcs: [
      {
        department: "14",
        name: "Point Relais Conseil",
        address: "52 rue saint Gabriel 14000 CAEN",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Espace Vitamines",
        address: "ZA de Nonant Rue des Longues Haies 14400 NONANT",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Point Relais Conseil",
        address: "29 rue des Arts 14100 LISIEUX",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Point Relais Conseil",
        address: "4 rue Alexandre Dubourg 14600 HONFLEUR",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Lycée Jean Mermoz GRETA Portes Normandes Point Relais Conseil",
        address: "1 rue Georges Fauvel 14500 VIRE",
        phone: "02 31 66 25 00",
        email: "prc-vire@ac-caen.fr",
      },
      {
        department: "27",
        name: "Association Acces Point Relais Conseil",
        address: "22 rue de la Charentonne 27300 BERNAY",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "27",
        name: "Point Relais Conseil",
        address: "52 rue Viuctor Hugo 27000 EVREUX",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "27",
        name: "Annexe mairie Point Relais Conseil",
        address: "Rue des Oiseaux 27700 LES ANDELYS",
        phone: "03 32 59 76 90",
        email: "vae@mlv2al.fr",
      },
      {
        department: "27",
        name: "Point Relais Conseil",
        address: "5 rue sain Louis 27400 LOUVIERS",
        phone: "02 32 25 06 72",
        email: "vae@mlv2al.fr",
      },
      {
        department: "27",
        name: "Pôle de Santé Libéral Ambulatoire Point Relais Conseil",
        address: "57 bis route de Lisieux 27500 PONT-AUDEMER",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "27",
        name: "Point Relais Conseil",
        address: "4 rue Septentrion 27100 VAL DE REUIL",
        phone: "02 32 59 76 90",
        email: "vae@mlv2al.fr",
      },
      {
        department: "27",
        name: "Centre Social Simone Veil Point Relais Conseil",
        address: "15 boulevard Aylmer Les Valmeux 27200 VERNON",
        phone: "02 32 59 76 90",
        email: "vae@mlv2al.fr",
      },
      {
        department: "50",
        name: "Centre d'Information et d'Orientation (CIO) Point Relais Conseil",
        address: "1 rue saint Martin 50300 AVRANCHES",
        phone: "02 33 58 72 66",
        email: "prc-avranches@ac-normandie.fr",
      },
      {
        department: "50",
        name: "Point Relais Conseil",
        address: "11 boulevard de Verdun 50500 CARENTAN-LES-MARAIS",
        phone: "02 33 05 62 08",
        email: "greta-st-lo@ac-caen.fr",
      },
      {
        department: "50",
        name: "Point Relais Conseil",
        address: "1 rue d'Anjou 50130 CHERBOURG-EN-COTENTIN",
        phone: "02 33 01 64 64",
        email: "mif@mef-cotentin.com",
      },
      {
        department: "50",
        name: "Centre de Formation GRETA Côtes Normandes Point Relais Conseil",
        address: "18 avenue de la République 50200 COUTANCES",
        phone: "02 33 19 05 40",
        email: "prc-coutances@ac-caen.fr",
      },
      {
        department: "50",
        name: "Lycée Julliot de la Morandière Point Relais Conseil",
        address: "Rue des LycéesBP 639 50406 GRANVILLE CEDEX",
        phone: "02 33 91 10 28",
        email: "prc-granville@ac-caen.fr",
      },
      {
        department: "50",
        name: "Point Relais Conseil",
        address: "242 rue de l'Exode 50000 SAINT-LO",
        phone: "02 33 05 62 08",
        email: "greta-st-lo@ac-caen.fr",
      },
      {
        department: "50",
        name: "Espace Emploi Formation MEF/MSAP Cœur Cotentin Point Relais Conseil",
        address: "22 rue de Poterie 50700 VALOGNES",
        phone: "02 33 40 33 71",
        email: "mif@mef-cotentin.com",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "26 rue du Pont Neuf 61100 ALENCON",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "1 rue de la Sente aux Bois 61200 ARGENTAN",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "16 rue Jacques Durmeyer 61100 FLERS",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "3 rue Jean-Baptiste Réveillon 61300 L'AIGLE",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "8 avenue Normandie Sussex BP 98 76203 DIEPPE",
        phone: "02 35 84 96 56",
        email: "mldca@mldieppe.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "25 rue Camille Randoing 76500 ELBEUF",
        phone: "02 32 96 44 30",
        email: "prc.vae@ml-elbeuf.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "95 rue Jules Ferry 76400 FECAMP",
        phone: "02 35 95 01 43",
        email: "prcvae-yvetot@mission-locale-csa.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "7 place Brévière 76440 FORGES-LES-EAUX",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "10 rue du Maréchal Delattre de Tassigny 76600 LE HAVRE",
        phone: "07 62 00 86 87",
        email: "prcvae-lehavre@infrep.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "Rue de l'Ancienne Verrerie 76470 LE TREPORT",
        phone: "02 35 86 88 59",
        email: "mldca@mldieppe.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address:
          "Parc d'Activités du Manoir Maison des Compétences 76170 LILLEBONNE",
        phone: "02 35 38 19 89",
        email: "prc.vae@ml-lillebonnecauxseine.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address:
          "Rouen rive droite : Immeuble Vauban Bâtiment A4-20 passage de la Luciline 76000 ROUEN",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address:
          "Rouen rive gauche : 108 avenue de Bretagne Immeuble Le Rollon 76100 ROUEN",
        phone: "02 35 62 60 27",
        email: "prcvae-rouen@infrep.org",
      },
    ],
  },
];
