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
          "Articuler le Projet de transition professionnelle et la VAE, c’est possible !",
        slug: "article-1",
        thumbnailUrl: "/regions/normandie/articles/article-1/thumbnail.png",
        summary:
          "La validation des acquis de l'expérience (VAE) permet à toute personne engagée dans la vie active de faire valider son expérience professionnelle et d'obtenir un diplôme, un titre professionnel ou un certificat de qualification.",
      },
    ],
    prcs: [
      {
        department: "14",
        name: "Point Relais Conseil",
        address: "52 rue saint Gabriel14000 CAEN",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Espace Vitamines",
        address: "ZA de NonantRue des Longues Haies14400 NONANT",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Point Relais Conseil",
        address: "29 rue des Arts14100 LISIEUX",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Point Relais Conseil",
        address: "4 rue Alexandre Dubourg14600 HONFLEUR",
        phone: "02 31 47 40 40",
        email: "prc.vae14@trajectio.fr",
      },
      {
        department: "14",
        name: "Lycée Jean MermozGRETA Portes NormandesPoint Relais Conseil",
        address: "1 rue Georges Fauvel14500 VIRE",
        phone: "02 31 66 25 00",
        email: "prc-vire@ac-caen.fr",
      },
      {
        department: "27",
        name: "Association AccesPoint Relais Conseil",
        address: "22 rue de la Charentonne27300 BERNAY",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "27",
        name: "Point Relais Conseil",
        address: "52 rue Viuctor Hugo27000 EVREUX",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "27",
        name: "Annexe mairiePoint Relais Conseil",
        address: "Rue des Oiseaux27700 LES ANDELYS",
        phone: "03 32 59 76 90",
        email: "vae@mlv2al.fr",
      },
      {
        department: "27",
        name: "Point Relais Conseil",
        address: "5 rue sain Louis27400 LOUVIERS",
        phone: "02 32 25 06 72",
        email: "vae@mlv2al.fr",
      },
      {
        department: "27",
        name: "Pôle de Santé Libéral AmbulatoirePoint Relais Conseil",
        address: "57 bis route de Lisieux27500 PONT-AUDEMER",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "27",
        name: "Point Relais Conseil",
        address: "4 rue Septentrion27100 VAL DE REUIL",
        phone: "02 32 59 76 90",
        email: "vae@mlv2al.fr",
      },
      {
        department: "27",
        name: "Centre Social Simone VeilPoint Relais Conseil",
        address: "15 boulevard AylmerLes Valmeux27200 VERNON",
        phone: "02 32 59 76 90",
        email: "vae@mlv2al.fr",
      },
      {
        department: "50",
        name: "Centre d'Information et d'Orientation (CIO)Point Relais Conseil",
        address: "1 rue saint Martin50300 AVRANCHES",
        phone: "02 33 58 72 66",
        email: "prc-avranches@ac-normandie.fr",
      },
      {
        department: "50",
        name: "Point Relais Conseil",
        address: "11 boulevard de Verdun50500 CARENTAN-LES-MARAIS",
        phone: "02 33 05 62 08",
        email: "greta-st-lo@ac-caen.fr",
      },
      {
        department: "50",
        name: "Point Relais Conseil",
        address: "1 rue d'Anjou50130 CHERBOURG-EN-COTENTIN",
        phone: "02 33 01 64 64",
        email: "mif@mef-cotentin.com",
      },
      {
        department: "50",
        name: "Centre de Formation GRETA Côtes NormandesPoint Relais Conseil",
        address: "18 avenue de la République50200 COUTANCES",
        phone: "02 33 19 05 40",
        email: "prc-coutances@ac-caen.fr",
      },
      {
        department: "50",
        name: "Lycée Julliot de la MorandièrePoint Relais Conseil",
        address: "Rue des LycéesBP 63950406 GRANVILLE CEDEX",
        phone: "02 33 91 10 28",
        email: "prc-granville@ac-caen.fr",
      },
      {
        department: "50",
        name: "Point Relais Conseil",
        address: "242 rue de l'Exode50000 SAINT-LO",
        phone: "02 33 05 62 08",
        email: "greta-st-lo@ac-caen.fr",
      },
      {
        department: "50",
        name: "Espace Emploi Formation MEF/MSAPCœur CotentinPoint Relais Conseil",
        address: "22 rue de Poterie50700 VALOGNES",
        phone: "02 33 40 33 71",
        email: "mif@mef-cotentin.com",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "26 rue du Pont Neuf61100 ALENCON",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "1 rue de la Sente aux Bois61200 ARGENTAN",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "16 rue Jacques Durmeyer61100 FLERS",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "61",
        name: "Point Relais Conseil",
        address: "3 rue Jean-Baptiste Réveillon61300 L'AIGLE",
        phone: "02 33 62 30 80",
        email: "prc.vae61@trajectio.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "8 avenue Normandie SussexBP 9876203 DIEPPE",
        phone: "02 35 84 96 56",
        email: "mldca@mldieppe.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "25 rue Camille Randoing76500 ELBEUF",
        phone: "02 32 96 44 30",
        email: "prc.vae@ml-elbeuf.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "95 rue Jules Ferry76400 FECAMP",
        phone: "02 35 95 01 43",
        email: "prcvae-yvetot@mission-locale-csa.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "7 place Brévière76440 FORGES-LES-EAUX",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "10 rue du Maréchal Delattre de Tassigny76600 LE HAVRE",
        phone: "07 62 00 86 87",
        email: "prcvae-lehavre@infrep.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address: "Rue de l'Ancienne Verrerie76470 LE TREPORT",
        phone: "02 35 86 88 59",
        email: "mldca@mldieppe.org",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address:
          "Parc d'Activités du ManoirMaison des Compétences76170 LILLEBONNE",
        phone: "02 35 38 19 89",
        email: "prc.vae@ml-lillebonnecauxseine.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address:
          "Rouen rive droite : Immeuble VaubanBâtiment A4-20 passage de la Luciline76000 ROUEN",
        phone: "02 76 55 57 13",
        email: "conseilvae@cibc-normandie.fr",
      },
      {
        department: "76",
        name: "Point Relais Conseil",
        address:
          "Rouen rive gauche : 108 avenue de BretagneImmeuble Le Rollon76100 ROUEN",
        phone: "02 35 62 60 27",
        email: "prcvae-rouen@infrep.org",
      },
    ],
  },
];
