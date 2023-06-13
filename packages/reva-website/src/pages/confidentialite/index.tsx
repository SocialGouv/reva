import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  ContentSection,
  MainTitle,
  SectionParagraph,
} from "@/components/legals-content/LegalsContent";
import Head from "next/head";
import { ReactNode } from "react";

const IndexConfidentialitePage = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px] overflow-x-hidden font-light">
      <Head>
        <title>Politique de confidentialité - France VAE</title>
      </Head>

      <div className="w-full max-w-[1048px] mx-auto">
        <MainTitle>Politique de confidentialité de France VAE</MainTitle>

        <ContentSection
          title="Qui est responsable de traitement France VAE ?"
          id="responsable"
        >
          <SectionParagraph>
            La plateforme « France VAE » est développée au sein de la Fabrique
            numérique des ministères sociaux.
          </SectionParagraph>
          <SectionParagraph>
            Le responsable de traitement est la Délégation générale à l’emploi
            et à la formation professionnelle (DGEFP) représentée par Monsieur
            Bruno Lucas.
          </SectionParagraph>
          <SectionParagraph>
            Le responsable de traitement s’engage à ce que la collecte et le
            traitement des données personnelles, effectués à partir de la
            plateforme France VAE soient conformes au règlement européen n°
            2016/679 général sur la protection des données du 27 avril 2016 dit
            « RGPD » et à la loi n° 78-17 relative à l’informatique, aux
            fichiers et aux libertés dite « LIL ».
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Pourquoi manipulons-nous des données ?"
          id="manipulation-donnees"
        >
          <SectionParagraph>
            France VAE manipule des données à caractère personnel pour les
            raisons suivantes :
            <ul className="list-inside">
              <li>
                Permettre aux personnes utilisatrices de candidater en vue
                d’obtenir une certification inscrite au répertoire national des
                certifications professionnelles (RNCP) en adéquation avec leurs
                compétences et leurs aspirations professionnelles ;
              </li>
              <li>
                Permettre aux personnes utilisatrices d’être accompagnées par un
                organisme spécialisé (architecte accompagnateur de parcours)
                dans la définition de leur projet, la description de leurs
                expériences, la rédaction du dossier professionnel et la
                préparation au jury ;
              </li>
              <li>
                Permettre aux organismes professionnels de l’accompagnement de
                suivre la confiance et la motivation de la personne candidate
                dans leurs parcours et dans le dispositif France VAE ;
              </li>
              <li>
                Permettre d’identifier les financeurs d’un parcours de VAE ;
              </li>
              <li>
                Reconnaître les expériences et compétences de l’utilisateur
                candidat ;
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
            France VAE traite les catégories de données suivantes de
            l’utilisateur candidat :
            <ul className="list-inside">
              <li>
                <strong>Données d’inscription et de candidature</strong>{" "}
                (adresse e-mail, numéro de téléphone, nom, prénom, département
                de résidence) ;
              </li>
              <li>
                <strong>Données relatives aux parcours du candidat</strong>{" "}
                (niveau de diplôme, expériences professionnelles, objectifs,
                indicateur public fragile des candidats, RQTH, bénéficiaire de
                minima sociaux, demandeur d’emploi de plus d’un an) ;
              </li>
              <li>
                <strong>
                  Données relatives aux expériences professionnelles
                </strong>{" "}
                (métier exercé, durée, champ libre en rapport avec l’expérience
                professionnelle) ;
              </li>
              <li>
                <strong>
                  Données relatives aux rendez-vous et suivi avec les
                  Architectes accompagnateurs de parcours
                </strong>{" "}
                (nom, prénom, e-mail, numéro de téléphone, département de
                résidence, niveau de diplôme, expériences professionnelles,
                objectifs, indicateur public fragile des candidats, RQTH,
                bénéficiaire de minima sociaux, demandeur d’emploi de plus d’un
                an).
              </li>
            </ul>
          </SectionParagraph>
          <SectionParagraph>
            France VAE traite également les catégories de données suivantes des
            architectes accompagnateurs de parcours (AAP) :
            <ul>
              <li>
                <strong>Données de compte des AAP</strong> (nom et prénom,
                adresse e-mail, adresse postale) ;
              </li>
              <li>
                <strong>Données de contact des AAP</strong> (adresse e-mail,
                numéro de téléphone).
              </li>
            </ul>
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Qu’est-ce qui nous autorise à manipuler ces données ?"
          id="autorisation"
        >
          <SectionParagraph>
            France VAE traite les données à caractère personnel en se basant sur
            l’exécution d’une mission d’intérêt public ou relevant de l’exercice
            de l’autorité publique dont est investi le responsable de traitement
            au sens de l’article 6-1 e) du RGPD.
          </SectionParagraph>
          <SectionParagraph>
            Cette mission d’intérêt public se traduit par les articles 4 et 6 de
            l’arrêté du 4 mai 2017 portant organisation de la délégation
            générale à l’emploi et à la formation professionnelle.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Pendant combien de temps conservons-nous ces données ?"
          id="duree"
        >
          <div className="fr-table">
            <table>
              <thead className="text-lg font-medium">
                <tr>
                  <th>Types de données</th>
                  <th>Durée de conservation</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr>
                  <TextCell>Données d’inscription et de candidature</TextCell>
                  <TextCell rowSpan={6}>
                    2 ans à compter de la dernière utilisation du compte par
                    l’utilisateur ou l’AAP
                  </TextCell>
                </tr>
                <tr>
                  <TextCell>Données relatives aux parcours</TextCell>
                </tr>
                <tr>
                  <TextCell>
                    Données relatives aux expériences professionnelles
                  </TextCell>
                </tr>
                <tr>
                  <TextCell>
                    Données aux rendez-vous et suivi avec des architectes
                    accompagnateurs de parcours
                  </TextCell>
                </tr>
                <tr>
                  <TextCell>
                    Données compte des architectes accompagnateurs de parcours
                  </TextCell>
                </tr>
                <tr>
                  <TextCell>Données de contact des AAP</TextCell>
                </tr>
                <tr>
                  <TextCell>Cookies</TextCell>
                  <TextCell>13 mois</TextCell>
                </tr>
              </tbody>
            </table>
          </div>
          <SectionParagraph>
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
            <ul className="list-inside">
              <li>Droit d’information et droit d’accès aux données;</li>
              <li>Droit de rectification des données;</li>
              <li>Droit à la limitation des données;</li>
              <li>Droit d’opposition;</li>
              <li>Droit à la portabilité de vos données;</li>
            </ul>
            Pour les exercer, contactez-nous à :{" "}
            <a href="mailto:contact@reva.beta.gouv.fr">
              contact@reva.beta.gouv.fr
            </a>
          </SectionParagraph>
          <SectionParagraph>
            Par voie postale :<br />
            Délégation générale à l'emploi et à la formation
            <br />
            10-18 place des 5-Martyrs-du-Lycée-Buffon
            <br />
            75015 Paris
          </SectionParagraph>
          <SectionParagraph>
            Puisque ce sont des droits personnels, nous ne traiterons votre
            demande que si nous sommes en mesure de vous identifier. Dans le cas
            où nous ne parvenons pas à vous identifier, nous pouvons être amenés
            à vous demander une preuve de votre identité.
          </SectionParagraph>
          <SectionParagraph>
            Pour vous aider dans votre démarche, vous trouverez un modèle de
            courrier élaboré par la CNIL ici : &nbsp;
            <a href="https://www.cnil.fr/fr/modele/courrier/exercer- son-droit-dacces">
              https://www.cnil.fr/fr/modele/courrier/exercer-son-droit-dacces
            </a>
          </SectionParagraph>
          <SectionParagraph>
            Nous nous engageons à vous répondre dans un délai raisonnable qui ne
            saurait dépasser 1 mois à compter de la réception de votre demande.
          </SectionParagraph>
        </ContentSection>

        <ContentSection
          title="Qui va avoir accès à ces données ?"
          id="qui-a-acces"
        >
          <SectionParagraph>
            Les membres de l’équipe France VAE en charge du recueil et de la
            sécurisation des données ainsi que ceux qui sont chargés du pilotage
            du projet et de l’étude des comportements utilisateurs auront accès
            à ces données personnelles.
          </SectionParagraph>
          <SectionParagraph>
            Des données personnelles pourront être partagées avec certains
            organismes référencés dans le service France VAE comme architecte de
            parcours ou accompagnateurs VAE ou centre de formation à des fins de
            contact, inscription aux services sollicitées et traitement de la
            candidature et de son financement.
          </SectionParagraph>
          <SectionParagraph>
            Les données sont envoyées aux AAP inscrits sur France VAE.
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
            <ul className="list-inside">
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
          </SectionParagraph>
          <SectionParagraph>
            <div className="fr-table">
              <table>
                <thead className="text-lg font-medium">
                  <tr>
                    <th>Partenaire</th>
                    <th>Pays destinataire</th>
                    <th>Traitement réalisé</th>
                    <th>Garanties</th>
                  </tr>
                </thead>
                <tbody className="text-lg">
                  <tr>
                    <TextBoldCell>Scalingo</TextBoldCell>
                    <TextCell>Europe</TextCell>
                    <TextCell>Infogérance</TextCell>
                    <LinkCell url="https://scalingo.com/fr/data-processing-agreement" />
                  </tr>
                  <tr>
                    <TextBoldCell>Outscale</TextBoldCell>
                    <TextCell>Europe</TextCell>
                    <TextCell>Hébergement du site web </TextCell>
                    <LinkCell url="https://fr.outscale.com/contact-donnees-personnelles/" />
                  </tr>
                  <tr>
                    <TextBoldCell>Crisp</TextBoldCell>
                    <TextCell>France</TextCell>
                    <TextCell>Chat de support </TextCell>
                    <LinkCell url="https://crisp.chat/fr/privacy/" />
                  </tr>
                  <tr>
                    <TextBoldCell>DigitalOcean, LLC</TextBoldCell>
                    <TextCell>Union européenne</TextCell>
                    <TextCell>Hébergement des données de Crisp</TextCell>
                    <LinkCell url="https://www.digitalocean.com/legal/data-processing-agreement " />
                  </tr>
                  <tr>
                    <TextBoldCell>Hotjar</TextBoldCell>
                    <TextCell>Irlande</TextCell>
                    <TextCell>Mesure d’audience</TextCell>
                    <TextCell>
                      <ul className="list-none">
                        <li>
                          <a href="https://help.hotjar.com/hc/en-us/articles/360058514233">
                            https://help.hotjar.com/hc/en-us/articles/360058514233
                          </a>
                        </li>
                        <li>
                          <a href="https://www.hotjar.com/legal/support/dpa/">
                            https://www.hotjar.com/legal/support/dpa/
                          </a>
                        </li>
                      </ul>
                    </TextCell>
                  </tr>
                  <tr>
                    <TextBoldCell>Amazon Web Services</TextBoldCell>
                    <TextCell>Irlande</TextCell>
                    <TextCell>Hébergement des données de Hotjar</TextCell>
                    <LinkCell url="https://aws.amazon.com/fr/blogs/security/aws-gdpr-data-processing-addendum/" />
                  </tr>
                  <tr>
                    <TextBoldCell>Matomo</TextBoldCell>
                    <TextCell>France</TextCell>
                    <TextCell>Mesure d’audience</TextCell>
                    <LinkCell url="https://fr.matomo.org/privacy-policy/" />
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionParagraph>
        </ContentSection>

        <ContentSection title="Qu’est-ce qu’un cookie ?" id="definition-cookie">
          <SectionParagraph>
            Un cookie est un fichier déposé sur votre terminal lors de la visite
            d’un site. Il a pour but de collecter des informations relatives à
            votre navigation et de vous adresser des services adaptés à votre
            terminal (ordinateur, mobile ou tablette).{" "}
          </SectionParagraph>
          <SectionParagraph>
            En application de l’article 5(3) de la directive 2002/58/CE modifiée
            concernant le traitement des données à caractère personnel et la
            protection de la vie privée dans le secteur des communications
            électroniques, transposée à l’article 82 de la loi n°78-17 du 6
            janvier 1978 relative à l’informatique, aux fichiers et aux
            libertés, les traceurs ou cookies suivent deux régimes distincts :
            <ul>
              <li>
                Les cookies strictement nécessaires au service ou ayant pour
                finalité exclusive de faciliter la communication par voie
                électronique sont dispensés de consentement préalable au titre
                de l’article 82 de la LIL ;
              </li>
              <li>
                Les cookies n’étant pas strictement nécessaires au service ou
                n’ayant pas pour finalité exclusive de faciliter la
                communication par voie électronique doivent être consenti par
                l’utilisateur. Ce consentement de la personne concernée pour une
                ou plusieurs finalités spécifiques constitue une base légale au
                sens du RGPD et doit être entendu au sens de l’article 6-a du
                RGPD.
              </li>
            </ul>
          </SectionParagraph>

          <SectionParagraph>
            La plateforme France VAE dépose différents cookies. Certains cookies
            impliquent un traitement de vos données personnelles au titre de la
            mission d’intérêt public qui nous incombe. Cela afin de faciliter
            votre navigation.
          </SectionParagraph>
          <SectionParagraph>
            La plateforme France VAE utilise des cookies afin de faire
            fonctionner le « chatbot » CRISP permettant une assistance continue
            sur la plateforme.
          </SectionParagraph>
          <SectionParagraph>
            La plateforme France VAE utilise des cookies de mesure d’audience
            anonymisée MATOMO. Pour mieux comprendre, l’outil MATOMO est un
            outil de mesure d’audience web libre, hébergé par les services de la
            Fabrique numérique des ministères sociaux et paramétré pour être en
            conformité avec la recommandation « Cookies » de la CNIL.
          </SectionParagraph>

          <SectionParagraph>
            <div className="fr-table">
              <table>
                <thead className="text-lg font-medium">
                  <tr>
                    <th>Cookie</th>
                    <th></th>
                    <th>Base juridique</th>
                    <th>Utilisation</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="text-lg">
                  <tr>
                    <TextBoldCell>Matomo</TextBoldCell>
                    <TextCell>France</TextCell>
                    <TextCell>Exemption de consentement</TextCell>
                    <TextCell>Mesure d’audience</TextCell>
                    <LinkCell url="https://fr.matomo.org/privacy-policy/" />
                  </tr>
                  <tr>
                    <TextBoldCell>Crisp</TextBoldCell>
                    <TextCell>Union européenne</TextCell>
                    <TextCell>Consentement</TextCell>
                    <TextCell>Support</TextCell>
                    <LinkCell url="https://crisp.chat/fr/privacy/" />
                  </tr>
                  <tr>
                    <TextBoldCell>Hotjar</TextBoldCell>
                    <TextCell>Irlande</TextCell>
                    <TextCell>Consentement</TextCell>
                    <TextCell>Mesure d’audience </TextCell>
                    <LinkCell url="https://help.hotjar.com/hc/en-us/articles/360058514233" />
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionParagraph>
          <SectionParagraph>
            Pour aller plus loin, vous avez la possibilité de consulter les
            fiches proposées par la CNIL grâce aux liens suivants :
            <ul className="list-inside">
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

const TextCell = ({
  className,
  children,
  rowSpan,
}: {
  className?: string;
  children: ReactNode;
  rowSpan?: number;
}) => (
  <td rowSpan={rowSpan} className={`px-1 border-r ${className || ""}`}>
    {children}
  </td>
);

const TextBoldCell = ({ children }: { children: ReactNode }) => (
  <TextCell className="font-normal">{children}</TextCell>
);

const LinkCell = ({ url }: { url: string }) => (
  <TextCell>
    <a href={url}>{url}</a>
  </TextCell>
);

export default IndexConfidentialitePage;
