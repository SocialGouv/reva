import Link from "next/link";

export const DatePrevisionnelleResourcesSection = () => {
  return (
    <aside className="hidden lg:block w-full bg-dsfrBlue-200 px-4 pt-4 pb-8 self-start">
      <div className="fr-text--lead font-bold">Ressources :</div>
      <div>
        <Link
          href="https://scribehow.com/o/BKyFuGicTyWaF4_KfL-uQA/viewer/Parcours_du_candidat_accompagne__vp9k4YzATvmheao9kAoKjw"
          className="fr-link fr-link--sm"
          target="_blank"
        >
          Consultez le guide pas à pas
        </Link>
      </div>
    </aside>
  );
};
