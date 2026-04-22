import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export const CandidateDecisionCommentSection = ({
  candidateDecisionComment,
}: {
  candidateDecisionComment: string;
}) => {
  return (
    <EnhancedSectionCard
      title="Commentaire du candidat"
      titleIconClass="ri-message-3-fill"
      data-testid="candidate-decision-comment-section"
    >
      <p className="md:pl-8 md:pr-6">“{candidateDecisionComment}”</p>
      <SmallNotice>
        Le certificateur a accès à ce commentaire. Ce retour peut compter dans
        la décision sur la recevabilité.
      </SmallNotice>
    </EnhancedSectionCard>
  );
};
