export default function CandidateDecisionCommentSection({
  candidateDecisionComment,
}: {
  candidateDecisionComment: string;
}) {
  return (
    <div className="ml-10">
      <div className="flex mb-4">
        <h4 className="mb-0">Commentaire du candidat</h4>
      </div>
      <p>“{candidateDecisionComment}”</p>
    </div>
  );
}
