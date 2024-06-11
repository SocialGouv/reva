const CommentFinancerVotreParcoursSelonVotreCertification = () => (
  <section
    id="comment-financer-votre-parcours"
    className="w-full bg-[#1B1B35] text-white py-14 lg:py-[88px]"
  >
    <div className="fr-container [&_p]:text-xl [&_p]:leading-relaxed [&_p]:mb-0 [&_h3]:text-white [&_h3]:lg:mb-12">
      <h2 className="text-white mb-14">Comment financer votre parcours ?</h2>
      <div className="flex flex-col items-stretch lg:flex-row lg:gap-12 w-full">
        <div className="flex-1 lg:border-r border-white pb-12 pr-12">
          <h3>Certifications prioritaires</h3>
          <p>
            Pour les certifications jugées prioritaires par l’Etat, France VAE
            finance les frais de parcours de ses candidats.
          </p>
        </div>
        <div className="flex-1">
          <h3>Autres certifications</h3>
          <p>
            Pour les autres certifications, tout ou une partie des frais de
            parcours peuvent être financés par des dispositifs comme{" "}
            <a target="_blank" href="https://www.moncompteformation.gouv.fr/">
              Mon Compte Formation
            </a>
            , les associations{" "}
            <a target="_blank" href="https://www.transitionspro.fr/">
              Transitions Pro
            </a>
            , l’entreprise du candidat, les financements régionaux ou{" "}
            <a target="_blank" href="https://www.francetravail.fr/">
              France Travail
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default CommentFinancerVotreParcoursSelonVotreCertification;
