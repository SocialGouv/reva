export interface Region {
  name: string;
  slug: string;
  logoUrl: string;
  articles: RegionArticle[];
  prcs: RegionPRC[];
  externalPrcsPageUrl?: string;
}

export interface RegionArticle {
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string;
  content: string;
}

export interface RegionPRC {
  name: string;
  department: string;
  address: string;
  phone: string;
  email: string;
}

export const regions: Region[] = [
  {
    name: "Normandie",
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
  {
    name: "Pays de la Loire",
    slug: "pays-de-la-loire",
    logoUrl: "/regions/pays-de-la-loire/logo.png",
    externalPrcsPageUrl:
      "https://www.choisirmonmetier-paysdelaloire.fr/information/recherche?toggle%5Bcep%5D=true#quoteZone",
    prcs: [],
    articles: [
      {
        title:
          "Vous avez entendu parler de la VAE et vous vous  demandez si c’est fait pour vous ?",
        slug: "article-1",
        thumbnailUrl:
          "/regions/pays-de-la-loire/articles/article-1/thumbnail.png",
        summary:
          "Des conseillers proches de chez vous, vous apportent gratuitement un premier niveau d’informations sur la VAE pour vous aider à apprécier l’opportunité de vous engager dans cette démarche.",
        content: `
          <p>
            Des conseillers proches de chez vous, vous apportent gratuitement un premier
            niveau d’informations sur la VAE pour vous aider à apprécier l’opportunité de
            vous engager dans cette démarche.
          </p>
          <p>
            Retrouvez
            <a
              target="_blank"
              href="https://www.choisirmonmetier-paysdelaloire.fr/information/recherche?libInsee=Nantes&radius=1000000#quoteZone"
              >la liste des organismes dispensant ce service en proximité.</a
            >
          </p>
          <p>
            La plateforme téléphonique « Choisir mon métier Pays de la Loire »
            <strong>0800 200 303</strong> peut également vous aider à identifier le bon
            interlocuteur près de chez vous.
          </p>
          <p>
            Par ailleurs, l’association Transition pro Pays de la Loire organise
            régulièrement
            <strong>des réunions d’information collectives sur la VAE</strong> à
            destination des salariés et des demandeurs d’emploi, sans condition.
          </p>
          <p>
            Pour en savoir plus,
            <a
              target="_blank"
              href="https://www.transitionspro-pdl.fr/je-suis-un-salariee/la-validation-des-acquis-et-de-lexperience/nos-reunions-vae/"
              >consultez le calendrier des réunions.</a
            >
          </p>
          <p>
            Pour aller plus loin dans votre réflexion, un
            <a
              target="_blank"
              href="https://www.choisirmonmetier-paysdelaloire.fr/article/le-conseil-en-evolution-professionnelle-cep"
              >conseiller en évolution professionnelle</a
            >
            (CEP) pourra étudier avec vous la pertinence du projet,
            <a target="_blank" href="https://www.francecompetences.fr/"
              >cibler les certifications correspondantes</a
            >, identifier les modalités de réalisation et de financement de la démarche
            VAE.
          </p>
          <p>
            En cas de besoin, le conseiller CEP pourra vous aiguiller vers
            <strong>un conseiller expert VAE</strong> (service gratuit proposé par la
            Région des Pays de la Loire) qui vous proposera un rendez-vous dans les 15
            jours pour approfondir votre projet.
          </p>
          <p>
            Pendant cette période de mise en œuvre progressive de la réforme, le
            conseiller en évolution professionnelle saura vous aiguiller dans vos
            démarches en fonction du diplôme ou de la certification visés.
          </p>
          <p>
            Pour en savoir plus,
            <a
              target="_blank"
              href="https://www.choisirmonmetier-paysdelaloire.fr/info-orientation/article/la-validation-des-acquis-de-lexperience-vae"
              >consultez la page officielle sur la VAE en Pays de la Loire.</a
            >
          </p>
        `,
      },
      {
        title: "Une VAE hybride pour les aides-soignants",
        slug: "article-2",
        thumbnailUrl:
          "/regions/pays-de-la-loire/articles/article-2/thumbnail.png",
        summary: "",
        content: `
          <p>
            Transitions Pro Pays de la Loire et l’IFSO (Institut de Formation en Santé de
            l’Ouest) ont mis en place un parcours de formation complémentaire à la
            démarche VAE. Cette action de formation est à destination des professionnels
            en poste visant le diplôme d’Etat Aide-Soignant.
          </p>
          <p>
            Elle est structurée sur 70h et s’articule en complément de l’ancien dispositif
            d’accompagnement VAE de 24h. L’objectif est de renforcer les connaissances des
            candidats pour leur permettre de rédiger un dossier professionnel riche et de
            sécuriser le passage devant le jury.
          </p>
          <p>
            De plus, ce dispositif de formation permet d’accompagner les salariés vers
            leur nouvelle fonction.
          </p>
          <p>
            <strong>Cinq candidats ont pu en bénéficier fin 2023</strong> : ils ont
            exprimé une vive satisfaction au regard de cet appui complémentaire et se
            disent aujourd’hui beaucoup plus confiants quant au passage devant le jury qui
            devrait intervenir prochainement.
          </p>
          <p>
            D’ores et déjà, de nombreuses structures, notamment des EPHAD, se disent
            intéressées pour s’inscrire dans ce dispositif en 2024 en complément de
            l’accompagnement France VAE.
          </p>
          <p>
            <a
              target="_blank"
              href="https://www.ifso-asso.org/formations-continues/vae-accompagnement-a-la-validation-des-acquis-de-lexperience-inter/"
              >Pour plus d’informations, consultez la page dédiée au dispositif.</a
            >
          </p>
        `,
      },
      {
        title:
          "Professionnels EFOP : faites le point sur la réforme avec l’atelier régional du 16 mai à Angers",
        slug: "article-3",
        thumbnailUrl:
          "/regions/pays-de-la-loire/articles/article-3/thumbnail.png",
        summary: "",
        content: `
          <p>
            La Région Pays de la Loire et le Cariforef des Pays de la Loire proposent aux
            acteurs de l’emploi, de la formation et de l’orientation professionnelles
            (EFOP) un atelier régional le 16 mai matin à Angers en présence d’Olivier
            Gérard, chef de projet national préfigurateur du service public de la VAE, et
            des principaux acteurs de la VAE en région (professionnels de l’information
            conseil VAE, certificateurs, financeurs, Architectes accompagnateurs de
            parcours).
          </p>
          <p>
            Cet atelier sera l’occasion de faire un point d’étape sur la mise en œuvre de
            la réforme et d’appréhender concrètement les questions qui se posent encore à
            ce stade de coexistence des deux systèmes.
          </p>
          <p>
            Pour en savoir plus et pour vous inscrire,
            <a
              target="_blank"
              href="https://pro.choisirmonmetier-paysdelaloire.fr/territoire/professionnalisation/Detail-d-une-formation?s=205691"
              >consultez la fiche programme.</a
            >
          </p>
        `,
      },
    ],
  },
];
