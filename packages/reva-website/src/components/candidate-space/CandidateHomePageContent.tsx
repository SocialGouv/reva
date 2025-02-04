import AccompagnementDemarche from "./AccompagnementDemarche";
import Articles from "./Articles";
import CommentFinancerVotreParcours from "./CommentFinancerVotreParcours";
import FaitesValiderVosCompetencesParUnDiplome from "./FaitesValiderVosCompetencesParUnDiplome";
import QuiPeutFaireUneVAE from "./QuiPeutFaireUneVAE";
import VousAvezBesoinDePlusDaide from "./VousAvezBesoinDePlusDaide";

export const CandidateHomePageContent = () => (
  <>
    <FaitesValiderVosCompetencesParUnDiplome />
    <QuiPeutFaireUneVAE />
    <VousAvezBesoinDePlusDaide />
    <AccompagnementDemarche />
    <CommentFinancerVotreParcours />
    <Articles />
  </>
);
