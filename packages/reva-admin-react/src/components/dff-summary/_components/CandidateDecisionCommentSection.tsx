export default function CandidateDecisionCommentSection({
  candidateDecisionComment,
}: {
  candidateDecisionComment: string;
}) {
  return (
    <div>
      <div className="flex mb-4">
        <span className="ri-message-3-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">Commentaire du candidat</h2>
      </div>
      <p>“{candidateDecisionComment}”</p>
    </div>
  );
}
