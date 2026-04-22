import Image from "next/image";

import documentSearchPolygon from "./assets/document-search-polygon.svg";

export const VaeCollectiveSelectCohortNotice = () => (
  <div className="flex flex-col items-center">
    <Image src={documentSearchPolygon} alt="icône recherche de document" />

    <h2 className="text-3xl text-center">Aucune cohorte sélectionnée</h2>
    <p className="text-xl leading-loose text-center">
      Naviguez dans le menu de vos cohortes afin de retrouver la candidature
      souhaitée.
    </p>
  </div>
);
