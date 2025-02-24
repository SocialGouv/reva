import AccompagnementDemarche from "@/components/candidate-space/AccompagnementDemarche";
import Articles from "@/app/_components/candidate-space/Articles";
import CommentFinancerVotreParcours from "@/components/candidate-space/CommentFinancerVotreParcours";
import FaitesValiderVosCompetencesParUnDiplome from "@/app/_components/candidate-space/FaitesValiderVosCompetencesParUnDiplome";
import QuiPeutFaireUneVAE from "@/components/candidate-space/QuiPeutFaireUneVAE";
import VousAvezBesoinDePlusDaide from "@/components/candidate-space/VousAvezBesoinDePlusDaide";
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
