import AccompagnementDemarche from "./AccompagnementDemarche";
import Articles from "./Articles";
import CommentFinancerVotreParcours from "./CommentFinancerVotreParcours";
import FaitesValiderVosCompetencesParUnDiplome from "./FaitesValiderVosCompetencesParUnDiplome";
import QuiPeutFaireUneVAE from "./QuiPeutFaireUneVAE";
import VousAvezBesoinDePlusDaide from "./VousAvezBesoinDePlusDaide";
import BackGroundUnions from "@/components/candidate-space/BackGroundUnions";

export const CandidateSpaceHomePageContent = () => (
  <>
    <BackGroundUnions />
    <FaitesValiderVosCompetencesParUnDiplome />
    <QuiPeutFaireUneVAE />
    <VousAvezBesoinDePlusDaide />
    <AccompagnementDemarche />
    <CommentFinancerVotreParcours />
    <Articles />
  </>
);
