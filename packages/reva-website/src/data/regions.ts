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
    name: "Centre Val de Loire",
    slug: "centre-val-de-loire",
    logoUrl: "/regions/centre-val-de-loire/logo.png",
    prcs: [
      {
        department: "18",
        name: "Espace VAE 18",
        address:
          "CIBC chez la Chambre des Métiers et de l’Artisanat Cher15 Rue Henri Dunant, 18000 Bourges",
        phone: "02 48 65 46 83",
        email: "contact@cibc18.fr",
      },
      {
        department: "28",
        name: "Espace VAE 28",
        address:
          "Les 2 Rives chez ADECCO CHARTRES 8 All. Prométhée, 28000 Chartres",
        phone: "06 64 66 53 24",
        email: "marina.danesin@les2rives.fr",
      },
      {
        department: "36",
        name: "Espace VAE 36",
        address:
          "Les 2 Rives chez ADECCO CHATEAUROUX 388 av de la Châtre 36000 CHATEAUROUX",
        phone: "06 64 66 53 24",
        email: "marina.danesin@les2rives.fr",
      },
      {
        department: "37",
        name: "Espace VAE 37",
        address: "36-42 route de Saint Avertin 37204 TOURS",
        phone: "02 47 25 24 85",
        email: "espacevae@cma-cvl.fr",
      },
      {
        department: "41",
        name: "Espace VAE 41",
        address: "16 rue de la Vallée Maillard 41000 BLOIS",
        phone: "02 47 25 24 85",
        email: "espacevae@cma-cvl.fr",
      },
      {
        department: "45",
        name: "Espace VAE 45",
        address: "931 rue de Bourges 45160 OLIVET",
        phone: "02 38 49 35 35",
        email: "v.odion@transitionspro-cvl.fr",
      },
    ],
    articles: [
      {
        title:
          "Avec la Région Centre Val-de-Loire, votre expérience a de la valeur",
        slug: "article-1",
        thumbnailUrl:
          "/regions/centre-val-de-loire/articles/article-1/thumbnail.png",
        summary:
          "Depuis plusieurs années, la Région Centre Val de Loire a mis en place une politique ambitieuse en matière de VAE.  Pour faciliter l'accès à la VAE, la Région finance 6 Espaces VAE sur le territoire régional (un par département).",
        content: `
          <p>
            Depuis plusieurs années, la Région Centre Val de Loire a mis en place une
            politique ambitieuse en matière de VAE. Pour faciliter l'accès à la VAE, la
            Région finance 6 Espaces VAE sur le territoire régional (un par département).
          </p>
          <p>Il s'agit d'un service ouvert à tous, gratuit, neutre et confidentiel.</p>
          <p>
            Un conseiller vous <strong>informe</strong> et vous
            <strong>accompagne</strong> dans votre projet. Il vous aide à trouver le bon
            diplôme (ou la certification) en fonction de votre projet et de votre
            expérience et vous met en relation avec les bons
            <strong>interlocuteurs.</strong>
          </p>
          <p>
            Il peut aussi vous réorienter vers d'autres dispositifs plus adaptés si
            nécessaire (formation, etc.)
          </p>
          <p>
            Vous le rencontrez <strong>en face à face</strong> ou
            <strong>à distance</strong> selon vos besoins et vos disponibilités.
          </p>
          <p>
            <a target="_blank" href="https://alfacentre.resovae.net/evenements-vae/"
              >Obtenez des informations en participant à un évènement</a
            >
            (réunion d'information, atelier, forum, …) organisé par les espaces VAE.
          </p>
          <p>
            Ou rapprochez-vous de
            <a target="_self" href="/regions/centre-val-de-loire/conseillers"
              >votre Espace VAE</a
            >
            pour obtenir un rendez-vous.
          </p>
          <p>
            <a
              target="_blank"
              href="https://orientation.centre-valdeloire.fr/sorienter-dans-sa-vie-professionnelle/sinformer/validation-des-acquis-de-lexperience"
              >Consultez la page officielle de la VAE du Centre Val de Loire</a
            >
          </p>
          <p class="mt-12">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/cOqZjr-2LJU?si=oxUsG4mpVqprsusg"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </p>
        `,
      },
      {
        title: "Financement",
        slug: "article-2",
        thumbnailUrl:
          "/regions/centre-val-de-loire/articles/article-2/thumbnail.png",
        summary: "",
        content: `
          <p>
            Si le parcours France VAE n'est pas accessible pour vous,
            <a target="_self" href="/regions/centre-val-de-loire/conseillers"
              >les conseillers VAE</a
            >
            peuvent vous aider à mobiliser différentes aides selon votre situation.
          </p>
          <p>
            <strong>Le chèque accompagnement VAE</strong> de la Région Centre-Val de Loire
            est une <strong>aide financière</strong> qui peut être mobilisée pour les
            demandeurs d'emploi et à la marge les salariés sans solution de financement.
          </p>
          <p>
            Pour plus d'informations,
            <a
              target="_blank"
              href="https://gipalfa.centre-valdeloire.fr/informer/dispositifs/validation-des-acquis-de-lexperience/financer-une-vae"
              >consultez le site du Gip Alfa Centre-Val de Loire.</a
            >
          </p>
        `,
      },
      {
        title: "Les rendez-vous des professionnels de la VAE",
        slug: "article-3",
        thumbnailUrl:
          "/regions/centre-val-de-loire/articles/article-3/thumbnail.png",
        summary: "",
        content: `
          <p>
            La Région a conçu une
            <strong>offre d’animation et de professionnalisation à la VAE,</strong>
            accessible à tous les professionnels intervenant dans les parcours
            d'accompagnement de l'emploi et de la formation.
          </p>
          <br/>
          <h2>Objectifs et enjeux :</h2>
          <ul>
            <li>
              Outiller les acteurs et accompagner l’évolution des pratiques en lien avec
              les enjeux régionaux et les évolutions réglementaires ;
            </li>
            <li>
              Renforcer les compétences cœur de métier, en favorisant les échanges entre
              les acteurs et en forgeant une culture partagée sur les priorités régionales
              ;
            </li>
            <li>
              Préparer les professionnels à répondre collectivement aux défis
              d’aujourd’hui et de demain sur la VAE
            </li>
          </ul>
          <p>
            Pour en savoir plus, consultez l’article  <a target="_blank" href="https://gipalfa.centre-valdeloire.fr/transformation-animation-vae">“Animation des acteurs de la VAE”</a> sur
            le site du Gip Alfa.
          </p>
          <p>
            Le Gip Alfa intervient en complémentarité de ces animations et propose des
            webinaires ouverts à tous les professionnels de l'emploi, la formation et
            l'orientation.
          </p>
          <p>
            Pour en savoir plus, consultez l’article <a target="_blank" href="https://gipalfa.centre-valdeloire.fr/actions-professionnalisation">“Les actions de professionnalisation”</a>
            sur le site du Gip Alfa.
          </p>
          <br/>
          <h2>Les outils du Gip Alfa</h2>
          <p>
            Le Gip Alfa, Carif Oref Centre-Val de Loire, met à disposition différents
            outils à destination du grand public et des professionnels :
          </p>
          <ul>
            <li><a target="_blank" href="https://alfacentre.resovae.net/evenements-vae/">Le site RésoVAE</a> permet à toute personne de :</li>
            <ul>
              <li>
                visualiser l’ensemble des informations collectives planifiées et
                manifestations auxquelles les Espaces VAE participent sur chacun des
                départements (forum, salon, …)
              </li>
              <li>
                s’inscrire directement à ces évènements et ainsi se mettre en contact avec
                des conseillers Espace VAE experts de ce dispositif.
              </li>
            </ul>
            <li>
              <a target="_blank" href="https://formation.centre-valdeloire.fr/">Le site formation</a> : pour accompagner le grand public et retrouver l'offre de
              formation régionale.
            </li>
            <li><a target="_blank" href="https://formation.centre-valdeloire.fr/notre-agenda">L’agenda des évènements en région</a> (informations collectives, etc.).</li>
            <li>
              <a target="_blank" href="https://gipalfa.centre-valdeloire.fr/actualites/nouveau-oriom-entree-dediee-observations-specifiques">Le site ORIOM</a> : pour les données socio-économiques, sectorielles par
              territoire.
            </li>
          </ul>      
      `,
      },
      {
        title: "Les entreprises",
        slug: "article-4",
        thumbnailUrl:
          "/regions/centre-val-de-loire/articles/article-4/thumbnail.png",
        summary: "",
        content: `
          <p>
            Depuis de nombreuses années, la Région Centre-Val de Loire poursuit sa volonté
            de développer la VAE comme
            <strong>un outil d’accès à la qualification</strong>, au bénéfice des actifs,
            des entreprises et des territoires.
          </p>
          <p>
            Pour professionnaliser et valoriser ses salariés ou pour développer les
            compétences de son entreprise, il existe de nombreuses raisons de s’intéresser
            à la VAE quand on est une entreprise.
          </p>
          <p>
            <a target="_self" href="/regions/centre-val-de-loire/conseillers"
              >Les espaces VAE</a
            >
            analysent vos besoins et vous conseillent pour la mise en place de solutions
            sur mesure individuelles ou collectives.
          </p>
          <br/>
          <h2>En s’investissant dans la VAE, l’entreprise :</h2>
          <ul>
            <li>recense, développe et actualise ses compétences internes.</li>
            <li>valorise, professionnalise et fidélise ses salariés.</li>
            <li>
              favorise la mobilité interne de ses salariés et résout ses difficultés de
              recrutement externe.
            </li>
            <li>améliore son image et renforce sa démarche qualité.</li>
            <li>réduit la durée et les coûts de ses formations.</li>
          </ul>
          <br/>
          <h2>La VAE collective : un outil au service des entreprises</h2>
          <p>
            L’entreprise peut non seulement encourager les démarches individuelles de VAE
            mais elle peut aussi prendre l’initiative d’organiser une VAE collective. Mise
            en œuvre pour plusieurs salariés en même temps, celle-ci peut également être
            réalisée entre plusieurs entreprises et être à l’initiative des branches
            professionnelles.
          </p>
          <br/>
          <h2>Ressources</h2>
          <p>
            <a
              target="_blank"
              href="https://gipalfa.centre-valdeloire.fr/sites/alfacentre/files/Upload/Formation_metiers/VAE/2023/Plaquette_entreprise.pdf"
              >Télécharger la plaquette d'information pour les entreprises
            </a>
          </p>
          <p class="mt-12">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/1cQtRZT43KY?si=UvJuXVPNG3mnXXu-"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </p>
        `,
      },
    ],
  },
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
