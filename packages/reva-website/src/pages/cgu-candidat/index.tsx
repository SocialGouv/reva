import { Cgu } from "@/components/cgu/Cgu";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const CguPage = () => (
  <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px] overflow-x-hidden font-light">
    <Head>
      <title>Conditions générales d'utilisation - France VAE</title>
    </Head>

    <div className="w-full max-w-[1048px] mx-auto py-10 px-4">
      <h1>Conditions générales d’utilisation de la Plateforme France VAE</h1>
      <p>
        Les présentes conditions générales d’utilisation (dites « CGU ») fixent
        le cadre juridique de la plateforme FRANCE VAE et définissent les
        conditions d’accès et d’utilisation des services par l’Utilisateur. Ce
        dispositif est un téléservice conformément aux dispositions de
        l’ordonnance 2005-1516 du 8 décembre 2005 relative aux échanges
        électroniques entre les usagers et les autorités administratives et
        entre les autorités administratives.
      </p>

      <h2>Article 1 – Présentation de FRANCE VAE</h2>
      <p>
        France VAE est ouvert à toute personne souhaitant obtenir une
        certification par la voie de la validation des acquis de l’expérience et
        par l’intermédiaire du dispositif France VAE. Il est également ouvert
        aux professionnels de France VAE qui peuvent avoir accès à des documents
        avec accès restreint.
      </p>
      <p>
        L’étendue du dispositif a vocation à évoluer. A ce jour, le périmètre de
        la certification est limité à certaines certifications des secteurs «
        santé, soin, dépendance », “métallurgie”, “grande distribution” et
        “sport”.
      </p>

      <h2>Article 2 – Définitions</h2>
      <p>
        « L'Utilisateur » est tout candidat utilisant le dispositif France VAE.
      </p>
      <p>
        Les « Architectes accompagnateurs de parcours » sont soumis à un cahier
        des charges d’offres et de services, et sont certifiés Qualiopi-VAE ou
        désignés par accord des branches professionnelles. Ce sont des
        organismes privés ou publics qui accompagnent les candidats dans
        l’obtention de la certification délivrée par les certificateurs. Les «
        Services » sont les fonctionnalités offertes par France VAE pour
        répondre à ses finalités.
      </p>
      <p>
        Les « Certificateurs » : ensemble des structures référencées par FRANCE
        VAE qui détiennent l'autorité sur la certification et traitent la
        recevabilité (sur la base d'un dossier de faisabilité), inscrivent (le
        cas échéant) le candidat à la certification, recueillent le dossier de
        validation, organisent les jurys et délivrent le résultat à la session
        de jury.
      </p>
      <h2>Article 3 – Fonctionnalités de la plateforme</h2>
      <h3>3.1 Candidature à la validation des acquis</h3>
      <p>
        Sur la page d’accueil du site, l’Utilisateur peut chercher le diplôme
        visé via la barre de recherche afin de créer un compte indispensable
        pour pouvoir utiliser le service.
      </p>
      <p>
        L’Utilisateur saisit les informations exigées, une fois le compte et le
        mot de passe créés, il a accès à son compte depuis son “espace
        candidat”. En saisissant son adresse e-mail, il reçoit un lien de
        connexion temporaire à usage unique pour se connecter. En cliquant sur
        le lien, l’Utilisateur accède à sa page de profil personnel.
      </p>
      <p>
        Une fois connecté, l’Utilisateur peut compléter son parcours étape par
        étape :
      </p>
      <ul>
        <li>
          Sélection d’une certification qu’il souhaite obtenir avec la VAE ;
        </li>
        <li>
          Choix des « objectifs » parmi une liste limitative (ex : avoir un
          meilleur salaire, me réorienter) ;
        </li>
        <li>Son département de résidence ;</li>
        <li>
          Expérience professionnelle en indiquant son métier (champ libre), il
          précise la durée de son expérience et l’ancienneté de celle-ci. Il
          peut compléter un champ libre afin de porter à la connaissance des
          Architectes accompagnateur de parcours toutes informations utiles ;
        </li>
        <li>
          Il sélectionne un Architecte accompagnateur de parcours parmi une
          liste proposée par la Plateforme France VAE.
        </li>
      </ul>

      <p>
        Il est à noter que toute candidature démarrée et non transmise à un
        architecte accompagnateur de parcours sera supprimée au bout de 2 mois.
        Le candidat pourra néanmoins renouveler sa candidature dès qu'il le
        souhaite.
      </p>

      <h3>
        3.2 Renseignement d’informations lors de la recherche des certifications
        disponibles
      </h3>
      <p>
        Tout Utilisateur de la Plateforme peut rechercher une certification
        éligible et se faire accompagner. Pour cela, il peut consulter la liste
        et cliquer sur l’une des certifications disponibles dans son secteur
        géographique (département), puis candidater en spécifiant son projet,
        ses motivations et ses expériences. Il devra choisir une structure
        professionnelle qui l’accompagnera dans ses démarches de VAE.
      </p>

      <h3>3.3 Validation du parcours</h3>
      <p>
        L’Architecte accompagnateur de parcours sélectionné analyse le dossier
        de candidature et propose un parcours à l’Utilisateur lors des temps
        d’entretien de faisabilité. L’Utilisateur peut visualiser le détail du
        parcours en accédant à son profil candidat puis en cliquant sur «
        Validez votre parcours ».
      </p>

      <p>
        Sur la page « Validez votre parcours » l’Utilisateur prend connaissance
        :
      </p>
      <ul>
        <li>
          Du nombre d’heures d’accompagnement individuel et collectif ainsi que
          les heures de formations complémentaires à suivre ;
        </li>
        <li>
          Des formations obligatoires à suivre (ex : sauveteur secouriste du
          travail).
        </li>
      </ul>

      <p>
        Il lui est précisé les savoirs de bases à acquérir ainsi que toutes
        autres informations nécessaires à la validation de sa VAE.
      </p>

      <p>
        L’Utilisateur peut consulter à tout moment son parcours en cliquant sur
        le bouton prévu à cet effet.
      </p>

      <h3>3.4 Réception de la réponse de recevabilité</h3>
      <p>
        L’Architecte accompagnateur de parcours sélectionné prépare le dossier
        de faisabilité du candidat et l’envoie à l’autorité certificatrice en
        charge de la certification visée. L’Utilisateur reçoit, après étude du
        dossier par le certificateur un mail lui indiquant le résultat de sa
        recevabilité.
      </p>

      <p>
        L’Architecte accompagnateur de parcours en est informé également via son
        espace.
      </p>
      <h2>Article 4 – Engagements respectifs</h2>
      <h3>4.1 L’Éditeur de la Plateforme</h3>
      <p>
        Les sources des informations diffusées sur notre Plateforme sont
        réputées fiables mais nous ne garantissons pas qu’elle soit exempte de
        défauts, d’erreurs ou d’omissions.
      </p>
      <p>
        Tout événement dû à un cas de force majeure ayant pour conséquence un
        dysfonctionnement de notre Plateforme et sous réserve de toute
        interruption ou modification en cas de maintenance, n'engage pas la
        responsabilité de France VAE.
      </p>
      <p>
        L’Éditeur s’autorise à suspendre ou révoquer n'importe quel compte et
        toutes les actions réalisées par ce biais, s’il estime que l’usage
        réalisé du service porte préjudice à son image ou ne correspond pas aux
        exigences de sécurité.
      </p>
      <p>
        L’Éditeur s’engage à la sécurisation de la Plateforme, notamment en
        prenant toutes les mesures nécessaires permettant de garantir la
        sécurité et la confidentialité des informations fournies.
      </p>
      <p>
        L’Éditeur fournit les moyens nécessaires et raisonnables pour assurer un
        accès continu, sans contrepartie financière à la Plateforme. Il se
        réserve la liberté de faire évoluer, de modifier ou de suspendre, sans
        préavis, la Plateforme pour des raisons de maintenance ou pour tout
        autre motif jugé nécessaire.
      </p>

      <h3>4.2 L’Utilisateur de la Plateforme</h3>

      <h4>A. Obligations de l’Utilisateur</h4>
      <p>
        L'Utilisateur s’engage à utiliser la Plateforme avec sincérité sans
        jamais être excessif, inapproprié ou insultant.
      </p>
      <p>
        Par ailleurs, nous considérons que l’Utilisateur doit respecter les
        engagements suivants, au risque d’une radiation :
      </p>
      <ul>
        <li>
          Respecter le parcours défini avec son architecte de parcours et qu’il
          devra valider ;
        </li>
        <li>
          Réaliser l’ensemble de son parcours sur une durée moyenne de 6 à 8
          mois. A la marge, l’architecte de parcours pourra étendre ce délai à
          12 mois maximum au regard de la situation particulière du candidat ;
        </li>
        <li>Ne suivre qu’une seule démarche VAE France VAE ;</li>
        <li>
          Informer France VAE et l’architecte de parcours de tout abandon sous
          48h ouvrées ;
        </li>
        <li>
          Informer son architecte de parcours et son accompagnateur de toute
          indisponibilité supérieure à 10 jours : l’indisponibilité ne doit pas
          retarder significativement la fin du parcours ;
        </li>
        <li>
          Indiquer une date prévisionnelle de dépôt ou fin de dossier
          d’expérience 1 à 2 mois après le premier rendez-vous d’accompagnement
          méthodologique ;
        </li>
        <li>
          Honorer les rendez-vous avec l’architecte de parcours,
          l’accompagnateur et le ou les organisme(s) de formation prévue.
        </li>
        <li>
          Signer les feuilles d'émargement et autres documents attestant des
          rendez-vous réalisés
        </li>
      </ul>

      <p>
        Toute information transmise par l'Utilisateur est de sa seule
        responsabilité. Il est rappelé que toute personne procédant à une fausse
        déclaration pour elle-même ou pour autrui s’expose, notamment, aux
        sanctions prévues à l’article 441-1 du code pénal, prévoyant des peines
        pouvant aller jusqu’à trois ans d’emprisonnement et 45 000 euros
        d’amende.
      </p>

      <p>
        L'Utilisateur s'engage à ne pas mettre en ligne de contenus ou
        informations contraires aux dispositions légales et réglementaires en
        vigueur.
      </p>

      <h4>B. Droits de l’Utilisateur</h4>
      <p>
        L’Utilisateur s’engage à l’assiduité sur le parcours proposé dans le
        cadre de la validation des acquis. Nous rappelons que France VAE a pour
        objet d’aider les personnes souhaitant se voir valider leurs acquis
        expérientiels (professionnels et personnels) en vue d’obtenir un
        diplôme, un titre ou un CQP. Une telle validation est un droit sous
        réserve de respecter les conditions de la validation, notamment
        l’assiduité.
      </p>
      <p>
        Spécifiquement, l’Utilisateur bénéficie de la mise en oeuvre précoce des
        nouveaux décrets normalement applicables au 01.01.2024 qui lui confère
        certains droits , qui sont de :
      </p>
      <ul>
        <li>
          Bénéficier d’allègement réglementaire (recevabilité, financement,
          accompagnement, jury) ;
        </li>
        <li>
          Bénéficier d’un financement unique pour l'accompagnement et des
          compléments formatifs ;
        </li>
        <li>
          Bénéficier du statut de stagiaire de la formation professionnelle ;
        </li>
        <li>Bénéficier de délais significativement réduits ;</li>
        <li>Bénéficier d’un parcours personnalisé et individualisé.</li>
      </ul>

      <h4>C. Règles d’assiduité</h4>
      <p>
        Chaque Utilisateur s’engage à respecter les règles relatives à
        l’assiduité. Toute violation de ces règles pourra mener à une cessation
        du suivi et une radiation de la Plateforme et du processus de validation
        des acquis.
      </p>
      <p>
        Sera considéré comme un manquement de l’Utilisateur : à partir de 2
        Absences non justifiées aux rendez-vous.
      </p>
      <p>
        Sera considérée comme une indisponibilité de l’Utilisateur : toute
        absence prolongée non justifiée du candidat supérieure ou égale à 2
        mois.
      </p>
      <p>Sera considéré comme un abandon de l’Utilisateur :</p>
      <ul>
        <li>
          Tout souhait de l’Utilisateur de ne pas donner suite à son parcours.
          Dans ce cas, l’Utilisateur doit signaler son abandon sous 48h ainsi
          que la raison de son abandon, l’annulation de parcours (à l’initiative
          du candidat) prendra effet aussitôt. La structure Professionnelle peut
          informer les parties prenantes et collecter les éléments de paiement.
          Le financeur libérera les fonds résiduels de l’Utilisateur ;
        </li>
        <li>
          Tout silence ou inaction de l’Utilisateur après un manquement. Dans ce
          cas, l’Architecte accompagnateur de parcours engagera une procédure
          d’annulation de parcours après un contact avec l’Utilisateur ou 3
          tentatives consécutives infructueuses de contact.
        </li>
      </ul>
      <p>
        Sera archivée, au bout de 15 jours, toute candidature n’ayant pas fait
        l’objet d’une prise de rdv après 3 tentatives de contact par la
        structure de l’Architecte accompagnateur de parcours, dès lors que
        celles-ci n’ont pas permis de joindre l’Utilisateur.
      </p>

      <h4>D. Conséquences du non-respect des règles d’assiduité</h4>
      <p>
        Tout abandon de l’Utilisateur ou toute indisponibilité peut mener à la
        procédure d’annulation du parcours.
      </p>
      <p>
        Dans ce cas, l’architecte accompagnateur de parcours adresse un courrier
        au candidat pour l’informer de la date du constat du manquement, de la
        nature du manquement et de l’arrêt de son parcours. Conformément aux
        dispositions des articles L.211-2, 7°, L.212-2 et L.411-2 du code des
        relations entre le public et l’administration, le courrier indiquera les
        motifs de la décision et les modalités et délais de recours. Lorsque le
        délai de recours est épuisé, l’annulation de parcours devient effective
        et la Structure Professionnelle peut informer les parties prenantes et
        collecter les éléments de paiement. Le financeur libérera les fonds
        résiduels du candidat.
      </p>

      <h2>Article 5 – Mise à jour des CGU</h2>
      <p>
        Les termes des présentes conditions d’utilisation peuvent être amendés à
        tout moment, sans préavis, en fonction des modifications apportées à la
        plateforme, de l’évolution de la législation ou pour tout autre motif
        jugé nécessaire. Les termes des présentes conditions générales
        d’utilisation s’imposent au public.
      </p>

      <p>Vous pouvez avoir accès à un versionnage des CGU ici :</p>
      <p>Dernière version des CGU : 12/03/2024</p>
    </div>
  </MainLayout>
);
export default CguPage;
