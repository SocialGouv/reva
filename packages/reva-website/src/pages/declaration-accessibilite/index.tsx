import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const DeclarationAccessibilitePage = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px] overflow-x-hidden font-light">
      <Head>
        <title>Déclaration d'accessibilité - France VAE</title>
      </Head>

      <div className="w-full max-w-[1048px] mx-auto py-20">
        <h1>DÉCLARATION D’ACCESSIBILITÉ</h1>

        <p>
          La DGEFP s’engage à rendre son site internet accessible conformément à
          l’article 47 de la loi n° 2005-102 du 11 février 2005.
        </p>

        <p>
          À cette fin, il met en œuvre la stratégie et les actions suivantes :
        </p>
        <ul>
          <li>corrections des dernières anomalies de l’audit</li>
        </ul>

        <p>
          Cette déclaration d’accessibilité s’applique à France VAE -{" "}
          <a href="https://www.vae.gouv.fr/">https://www.vae.gouv.fr/</a>
        </p>

        <h2 className="mt-8">ÉTAT DE CONFORMITÉ</h2>
        <p>
          DGEFP- France VAE -{" "}
          <a href="https://www.vae.gouv.fr/">https://www.vae.gouv.fr/</a> est en
          conformité partielle avec le référentiel général d’amélioration de
          l’accessibilité (RGAA), version 4.1 en raison des non-conformités et
          des dérogations énumérées ci-dessous.
        </p>

        <h2 className="mt-8">RÉSULTATS DES TESTS</h2>
        <p>L’audit de conformité réalisé par Urbilog révèle que :</p>
        <ul>
          <li>91% des critères du RGAA version 4.1 sont respectés.</li>
          <li>Le taux moyen de conformité du service en ligne est de 94%.</li>
        </ul>

        <p>Nombre de critères applicables : 53</p>
        <p>Nombre de critères conformes : 48</p>
        <p>Nombre de critères non conformes : 5</p>

        <h2 className="mt-8">CONTENUS NON ACCESSIBLES</h2>
        <p>
          Les contenus listés ci-dessous ne sont pas accessibles pour les
          raisons suivantes :
        </p>
        <h3>NON CONFORMITÉ</h3>
        <ul className="list-none">
          <li>
            <span className="font-bold italic">7. Scripts</span>
            <ul>
              <li>
                Nature des boutons non identifiable à l'utilisation des flèches
                directionnelles
              </li>
              <li>
                Absence de l'attribut "aria-expanded" sur l'ouvrir / fermer
              </li>
              <li>
                Listes déroulantes ayant des cases à cocher mal restitués aux
                lecteurs d'écrans
              </li>
              <li>
                Présence des attributs "autocomplete" sur les champs de nombres
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold italic">8. Éléments obligatoires</span>
            <ul>
              <li>Présence d'erreur dans le code source de la page</li>
              <li>Le titre de la page n’est pas pertinent ou incomplet</li>
            </ul>
          </li>
          <li>
            <span className="font-bold italic">11. Formulaires</span>
            <ul>
              <li>Absence de messages d'erreur provenant du site</li>
              <li>Absence de suggestion de saisie</li>
              <li>Message d'erreur non pertinent</li>
            </ul>
          </li>
        </ul>

        <h2 className="mt-8">DÉROGATION POUR CHARGE DISPROPORTIONNÉE</h2>
        <p>Néant</p>

        <h2 className="mt-8">
          CONTENUS NON-SOUMIS À L’OBLIGATION D’ACCESSIBILITÉ
        </h2>
        <p>Néant</p>

        <h2 className="mt-8">
          ÉTABLISSEMENT DE CETTE DÉCLARATION D’ACCESSIBILITÉ
        </h2>
        <p>
          Cette déclaration d’accessibilité a été établie le 01 juillet 2023.
        </p>

        <h2 className="mt-8">
          TECHNOLOGIES UTILISÉES POUR LA RÉALISATION DU SITE
        </h2>
        <ul>
          <li>HTML 5</li>
          <li>CSS</li>
          <li>Javascript</li>
          <li>SVG</li>
          <li>Aria</li>
        </ul>

        <h2 className="mt-8">ENVIRONNEMENT DE TEST</h2>
        <p>
          Les vérifications de restitution de contenus ont été réalisées sur la
          base de la combinaison fournie par la base de référence du RGAA 4.1,
          avec les versions suivantes :
        </p>
        <ul>
          <li>NVDA 2021.2 et Firefox 98</li>
          <li>VoiceOver Mac OS 12.2 et Safari 15.3</li>
        </ul>

        <h2 className="mt-8">OUTILS POUR ÉVALUER L’ACCESSIBILITÉ</h2>
        <ul>
          <li>
            Barre extension de contrôle de taux de contraste WCAG Color Contrast
            Checker
          </li>
          <li>Barre extension Assistant RGAA V4.1 Compéthance</li>
          <li>Barre extension Web Developer toolbar</li>
          <li>Inspecteur du navigateur</li>
          <li>UserCSS/Stylus</li>
        </ul>

        <h2 className="mt-8">
          PAGES DU SITE AYANT FAIT L’OBJET DE LA VÉRIFICATION DE CONFORMITÉ
        </h2>
        <ul>
          <li>
            Accueil - <a href="http://vae.gouv.fr">http://vae.gouv.fr</a>
          </li>
          <li>
            Mentions légales -{" "}
            <a href="http://vae.gouv.fr/mentions-legales/">
              http://vae.gouv.fr/mentions-legales/
            </a>
          </li>
          <li>
            Plan de site -{" "}
            <a href="http://vae.gouv.fr/plan-du-site/">
              http://vae.gouv.fr/plan-du-site/
            </a>
          </li>
          <li>
            Parcours candidat / inscription -{" "}
            <a href="https://vae.gouv.fr/app/">https://vae.gouv.fr/app/</a>
          </li>
          <li>
            Parcours candidat / Effectuer une demande -{" "}
            <a href="https://vae.gouv.fr/app/">https://vae.gouv.fr/app/</a>
          </li>
          <li>
            Parcours espace pro / Création de compte -{" "}
            <a href="https://vae.gouv.fr/espace-professionnel/creation/">
              https://vae.gouv.fr/espace-professionnel/creation/
            </a>
          </li>
          <li>
            Parcours espace pro / valider une candidature (jusqu’à la
            transmission des pièces justificatives) -{" "}
            <a href="https://vae.gouv.fr/espace-professionnel/creation/">
              https://vae.gouv.fr/espace-professionnel/creation/
            </a>
          </li>
        </ul>
        <h2 className="mt-8">RETOUR D’INFORMATION ET CONTACT</h2>
        <p>
          Si vous n’arrivez pas à accéder à un contenu ou à un service, vous
          pouvez contacter le responsable de l’accessibilité{" "}
          <a href="mailto:accessibilite@vae.gouv.fr">
            accessibilite@vae.gouv.fr
          </a>{" "}
          pour être orienté vers une alternative accessible ou obtenir le
          contenu sous une autre forme.
        </p>

        <h2 className="mt-8">VOIES DE RECOURS</h2>
        <p>
          Cette procédure est à utiliser dans le cas suivant. Vous avez signalé
          au responsable du site internet un défaut d’accessibilité qui vous
          empêche d’accéder à un contenu ou à un des services du portail et vous
          n’avez pas obtenu de réponse satisfaisante.
        </p>
        <ul>
          <li>
            Écrire un message au Défenseur des droits -{" "}
            <a href="https://formulaire.defenseurdesdroits.fr/">
              https://formulaire.defenseurdesdroits.fr/
            </a>
          </li>
          <li>
            Contacter le délégué du Défenseur des droits dans votre région -{" "}
            <a href="https://www.defenseurdesdroits.fr/saisir/delegues">
              https://www.defenseurdesdroits.fr/saisir/delegues
            </a>
          </li>
          <li>
            Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)
            : Défenseur des droits Libre réponse 71120 75342 Paris CEDEX 07
          </li>
        </ul>
      </div>
    </MainLayout>
  );
};

export default DeclarationAccessibilitePage;
