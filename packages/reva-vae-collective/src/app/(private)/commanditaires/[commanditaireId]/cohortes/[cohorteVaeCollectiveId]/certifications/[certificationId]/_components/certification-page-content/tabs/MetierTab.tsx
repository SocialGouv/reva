import Link from "next/link";

export const MetierTab = ({
  codeRncp,
  rncpObjectifsContexte,
}: {
  codeRncp: string;
  rncpObjectifsContexte?: string | null;
}) => (
  <div className="flex flex-col">
    {rncpObjectifsContexte && (
      <>
        <h2 className="text-xl">Résumé du métier</h2>
        <p>{rncpObjectifsContexte}</p>
      </>
    )}
    <h2 className="text-xl">Activités visées par le diplôme</h2>
    <p>
      Chaque diplôme correspond à un Référentiel d’Activités et de Compétences
      (REAC). Ce document liste les tâches et compétences attendues pour obtenir
      le diplôme.
    </p>
    <h3 className="text-base">Pourquoi c'est important ?</h3>
    <p>
      Avant de vous lancer, comparez les activités que vous avez exercées avec
      celles demandées pour le diplôme visé. C'est la première étape pour voir
      si votre projet de parcours de VAE est possible.
    </p>
    <p>
      Pour comparer les activités avec vos expériences :{" "}
      <Link
        className="fr-link"
        target="_blank"
        href={`https://www.francecompetences.fr/recherche/rncp/${codeRncp}`}
      >
        Consulter les activités ce diplôme sur le RNCP
      </Link>
    </p>
  </div>
);
