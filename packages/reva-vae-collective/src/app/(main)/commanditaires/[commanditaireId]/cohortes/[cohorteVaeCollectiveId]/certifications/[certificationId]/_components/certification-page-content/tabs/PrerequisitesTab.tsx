export const PreRequisitesTab = ({
  prerequisites,
}: {
  prerequisites: { id: string; label: string }[];
}) => (
  <div className="flex flex-col">
    <h2 className="text-xl">Prérequis obligatoires</h2>
    <p>
      Avant de commencer votre parcours de VAE, il est important de vérifier les
      prérequis exigés par le certificateur pour le diplôme visé.Ces conditions
      sont obligatoires. Vous devez justifier de leur détention au moment du
      passage devant le jury en fin de parcours de VAE.
    </p>
    {prerequisites.length ? (
      <ul>
        {prerequisites.map((p) => (
          <li key={p.id}>{p.label}</li>
        ))}
      </ul>
    ) : (
      <div className="flex gap-2">
        <span className="fr-icon-info-fill text-dsfrGray-mentionGrey" />
        <p className="text-dsfrGray-titleGrey italic">
          Il n’y a pas de prérequis obligatoire renseigné pour ce diplôme
        </p>
      </div>
    )}
  </div>
);
