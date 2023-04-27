import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const IndexConfidentialitePage = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px]">
      <Head>
        <title>Politique de confidentialité - Reva</title>
      </Head>

      <div className="w-full max-w-[1048px] mx-auto">
        <MainTitle>Politique de confidentialité de REVA</MainTitle>

        <ContentSection title="Qui est responsable de REVA ?" id="responsable">
          <SectionParagraph>
            La plateforme « REVA » est développée au sein de la Fabrique
            numérique des ministères sociaux. Le responsable de l’utilisation
            des données est la Délégation générale à l’emploi et à la formation
            professionnelle (DGEFP) représentée par Monsieur Bruno Lucas.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Pourquoi manipulons-nous des données ?"
          id="manipulation-donnees"
        >
          <SectionParagraph>
            REVA manipule des données à caractère personnel pour les raisons
            suivantes :
            <ul>
              <li>
                Permettre aux personnes utilisatrices de candidater simplement
                en vue d’obtenir une certification en adéquation avec leurs
                compétences et leurs aspirations professionnelles;
              </li>
              <li>
                Permettre aux personnes utilisatrices d’être accompagnées par un
                organisme spécialisé dans la définition de leur projet, la
                description de leurs expériences, la rédaction du dossier
                professionnel et la préparation au jury;
              </li>
              <li>
                Suivre la confiance et la motivation de la personne candidate
                dans son parcours et dans le dispositif expérimental REVA;
              </li>
              <li>
                Reconnaître les expériences et compétences de la personne
                candidate;
              </li>
              <li>
                Étudier et comprendre les comportements des utilisateurs sur la
                plateforme.
              </li>
            </ul>
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Quelles sont les données que nous manipulons ?"
          id="quelles-donnees"
        >
          <SectionParagraph>
            REVA traite les données et catégories de données suivantes :
            <ul>
              <li>
                Données relatives au candidat (Nom, prénom, adresse e-mail,
                genre,nationalité)
              </li>
              <li>
                Données relatives à la situation sociale et professionnelle du
                candidat (Indicateur public fragile des candidats, RQTH, minima
                sociaux, demandeur d’emploi de plus d’un an, haut niveau de
                diplôme, dernier diplôme obtenu)
              </li>
              <li>
                Données de contact de la structure (adresse e-mail, nom, prénom)
              </li>
            </ul>
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Qu’est-ce qui nous autorise à manipuler ces données ?"
          id="autorisation"
        >
          <SectionParagraph>
            REVA traite les données à caractère personnel en se basant sur :
            <ul>
              <li>
                L’exécution d’une mission d’intérêt public ou relevant de
                l’exercice de l’autorité publique dont est investi le
                responsable de traitement au sens de l’article 6-1 e) du RGPD.
              </li>
            </ul>
            Cette mission d’intérêt public se traduit par les articles 4 et 6 de
            l’arrêté du 4 mai 2017 portant organisation de la délégation
            générale à l’emploi et à la formation professionnelle.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Pendant combien de temps conservons-nous ces données ?"
          id="duree"
        >
          <SectionParagraph>
            La durée de conservation de ces données est de 24 mois :
            <ul>
              <li>
                à partir du dernier contact avec la personne candidate, afin de
                permettre aux candidats de poursuivre leur projet de VAE.
              </li>
              <li>à partir du dernier contact avec le professionnel.</li>
            </ul>
            Au-delà de cette durée, afin d’étudier et comprendre les
            comportements des utilisateurs jusqu’à la fin du parcours (résultat
            à l’issue du jury et insertion professionnelle), nous procédons à
            l’anonymisation des données nécessaires à l’amélioration du
            processus et nous supprimons les autres données à caractère
            personnel.
          </SectionParagraph>
        </ContentSection>

        <ContentSection title="Quels droits avez-vous ?" id="droits">
          <SectionParagraph>
            Vous disposez des droits suivants concernant vos données à caractère
            personnel :
            <ul>
              <li>Droit d’information et droit d’accès aux données;</li>
              <li>Droit de rectification des données;</li>
              <li>Droit à la limitation des données;</li>
              <li>Droit d’opposition;</li>
              <li>Droit à la portabilité de vos données;</li>
            </ul>
            Pour les exercer, contactez-nous à : contact@reva.beta.gouv.fr Par
            voie postale : Délégation générale à l'emploi et à la formation
            10-18 place des 5-Martyrs-du-Lycée-Buffon 75015 Paris Puisque ce
            sont des droits personnels, nous ne traiterons votre demande que si
            nous sommes en mesure de vous identifier. Dans le cas où nous ne
            parvenons pas à vous identifier, nous pouvons être amenés à vous
            demander une preuve de votre identité. Pour vous aider dans votre
            démarche, vous trouverez un modèle de courrier élaboré par la CNIL
            ici :
            https://www.cnil.fr/fr/modele/courrier/exercer-son-droit-dacces Nous
            nous engageons à vous répondre dans un délai raisonnable qui ne
            saurait dépasser 1 mois à compter de la réception de votre demande.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Qui va avoir accès à ces données ?"
          id="qui-a-acces"
        >
          <SectionParagraph>
            Les membres de l’équipe REVA en charge du recueil et de la
            sécurisation des données ainsi que ceux qui sont chargés du pilotage
            du projet et de l’étude des comportements utilisateurs auront accès
            à ces données personnelles. Des données personnelles pourront être
            partagées avec certains organismes référencés dans le service REVA
            comme architecte de parcours ou accompagnateurs VAE ou centre de
            formation à des fins de contact, inscription aux services
            sollicitées et traitement de la candidature et de son financement.
            Les données sont envoyées aux organismes certificateurs etb: ou aux
            architectes accompagnateurs de parcours suivants :
            <ul>
              <li>Ministère de l’agriculture</li>
              <li>Les 2 Rives</li>
              <li>Domus Vi</li>
              <li>Pôle Emploi Lille Vaucanson</li>
              <li>Agence Pôle Emploi Verriers Mulhouse</li>
              <li>LEAP Harol</li>
              <li>DAVA – Dispositif Académique de Validation des Acquis</li>
              <li>ASP – Agence de Services et de Paiement</li>
              <li>
                Ministère des solidarités et de la santé, notamment la Direction
                Générale de la Cohésion Sociale (DGCS)
              </li>
              <li>IPERIA</li>
              <li>Ministère de l’Education nationale (EducNat)</li>
              <li>FEPEM – Branche Particulier-Employeur</li>
              <li>Croix Rouge</li>
              <li>AFPA</li>
              <li>CROFF Consulting</li>
              <li>Ministère du Travail, de l’emploi et de l’insertion</li>
              <li>
                Directions régionales de l’économie, de l’emploi, du travail et
                des solidarités (DREETS)
              </li>
              <li>CNEAP</li>
            </ul>
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Quelles mesures de sécurité mettons-nous en place ?"
          id="mesures-securite"
        >
          <SectionParagraph>
            Les mesures techniques et organisationnelles de sécurité adoptées
            pour assurer la confidentialité, l’intégrité et protéger l’accès des
            données sont notamment :
            <ul>
              <li>Stockage des données en base de données</li>
              <li>Stockage des mots de passe en base sont hachés</li>
              <li>Cloisonnement des données</li>
              <li>Mesures de traçabilité</li>
              <li>Surveillance</li>
              <li>
                Protection contre les virus, malwares et logiciels espions
              </li>
              <li>Protection des réseaux</li>
              <li>Sauvegarde</li>
              <li>
                Mesures restrictives limitant l’accès physiques aux données à
                caractère personnel
              </li>
            </ul>
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Qui nous aide à manipuler vos données ?"
          id="qui-aide"
        >
          <SectionParagraph>
            Certaines des données sont envoyées à des sous-traitants pour
            réaliser certaines missions. Le responsable de traitement s'est
            assuré de la mise en œuvre par ses sous-traitants de garanties
            adéquates et du respect de conditions strictes de confidentialité,
            d’usage et de protection des données.
            <table>
              <tr>
                <th>Partenaire</th>
                <th>Pays destinataire</th>
                <th>Traitement réalisé</th>
                <th>Garanties</th>
              </tr>
              <tr>
                <td>Scalingo</td>
                <td>France</td>
                <td>Hébergement SecNumCloud</td>
                <td>https://scalingo.com/fr/data-processing-agreement</td>
              </tr>
              <tr>
                <td>Matomo</td>
                <td>France</td>
                <td>Mesure d’audience</td>
                <td>https://fr.matomo.org/privacy-policy/</td>
              </tr>
              <tr>
                <td>Crisp</td>
                <td>Union européenne</td>
                <td>Support</td>
                <td>https://crisp.chat/fr/privacy/</td>
              </tr>
              <tr>
                <td>Hotjar</td>
                <td>Irlande</td>
                <td>Mesure d’audience </td>
                <td>https://help.hotjar.com/hc/en-us/articles/360058514233 </td>
              </tr>
            </table>
          </SectionParagraph>
        </ContentSection>

        <ContentSection title="Qu’est-ce qu’un cookie ?" id="definition-cookie">
          <SectionParagraph>
            Un cookie est un fichier déposé sur votre terminal lors de la visite
            d’un site. Il a pour but de collecter des informations relatives à
            votre navigation et de vous adresser des services plus
            personnalisés, adaptés à vos usages.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Pourquoi la plateforme REVA utilise des cookies ?"
          id="pourquoi-cookies"
        >
          <SectionParagraph>
            La plateforme REVA dépose différents cookies. Certains cookies
            impliquent un traitement de vos données personnelles au titre de la
            mission d’intérêt public qui nous incombe. Cela afin de faciliter
            votre navigation.
          </SectionParagraph>
          <SectionParagraph>
            La plateforme REVA utilise des cookies afin de faire fonctionner le
            chatbot permettant une assistance continue sur la plateforme.
          </SectionParagraph>
          <SectionParagraph>
            La plateforme REVA utilise des cookies de mesure d’audience
            anonymisée. Conformément aux dispositions de l’article 5 de la
            délibération CNIL numéro 2020-091 du 17 septembre 2020, l’usage de
            ces cookies de mesure d’audience est dispensé du recueil de votre
            consentement.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Quels sont les cookies déposés sur la plateforme REVA ?"
          id="quels-cookies"
        >
          <SectionParagraph>
            Nous vous informons que la plateforme REVA utilise des cookies
            nécessaires au bon fonctionnement et à la sécurisation du site, mais
            également des outils de mesure d’audience.
          </SectionParagraph>
          <SectionParagraph>
            <table>
              <tr>
                <th>Cookie</th>
                <th></th>
                <th>Base juridique</th>
                <th>Utilisation</th>
                <th></th>
              </tr>
              <tr>
                <td>Matomo</td>
                <td>France</td>
                <td>Exemption de consentement</td>
                <td>Mesure d’audience</td>
                <td>https://fr.matomo.org/privacy-policy/</td>
              </tr>
              <tr>
                <td>Crisp</td>
                <td>Union européenne</td>
                <td>Consentement</td>
                <td>Support</td>
                <td>https://crisp.chat/fr/privacy/</td>
              </tr>
              <tr>
                <td>Hotjar</td>
                <td>Irlande</td>
                <td>Consentement</td>
                <td>Mesure d’audience </td>
                <td>https://help.hotjar.com/hc/en-us/articles/360058514233</td>
              </tr>
            </table>
          </SectionParagraph>
          <SectionParagraph>
            Pour mieux comprendre, l’outil MATOMO est un outil de mesure
            d’audience web libre, hébergé par les services de la Fabrique
            numérique des ministères sociaux et paramétré pour être en
            conformité avec la recommandation « Cookies » de la CNIL.
          </SectionParagraph>
          <SectionParagraph>
            Pour aller plus loin, vous avez la possibilité de consulter les
            fiches proposées par la CNIL grâce aux liens suivants :
            <ul>
              <li>
                <a href="https://www.cnil.fr/fr/cookies-et-traceurs-que-dit-la-loi">
                  Cookies & traceurs : que dit la loi ?
                </a>
              </li>
              <li>
                <a href="https://www.cnil.fr/fr/les-conseils-de-la-cnil-pour-maitriser-votre-navigateur">
                  Cookies : les outils pour les maîtriser
                </a>
              </li>
            </ul>
          </SectionParagraph>
        </ContentSection>
      </div>
    </MainLayout>
  );
};

const ContentSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mb-8 pl-3">
    <SectionHeader>{title}</SectionHeader>
    {children}
  </section>
);

const MainTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h1
    className={`pl-3 my-8 text-[20px] md:text-[32px] xl:text-[48px] ${className}`}
  >
    {children}
  </h1>
);

const SectionHeader = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h2 className={`text-[16px] md:text-[20px] xl:text-[40px] ${className}`}>
    {children}
  </h2>
);

const SectionParagraph = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <p className={`text-lg md:text-xl xl:text-2xl ${className}`}>{children}</p>
);

export default IndexConfidentialitePage;
