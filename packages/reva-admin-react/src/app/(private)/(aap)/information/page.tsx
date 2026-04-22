"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

export default function InformationPage() {
  return (
    <div>
      <div className="[&_p]:text-xl [&_p]:leading-relaxed">
        <h1>Nouveau</h1>
        <p>
          Nous vous invitons à lire avec attention les informations suivantes, à
          lire attentivement les CGU et le cahier des charges et, à{" "}
          <a href="https://vae.gouv.fr/nous-contacter/">nous consulter</a> si
          vous avez besoin de précisions.
        </p>
        <hr className="mt-12 mb-6" />
      </div>
      <div className="[&_p]:text-lg [&_h3]:text-xl [&_li]:my-3">
        <h2>Titre 1</h2>
        <p>Liste :</p>
        <ul className="text-lg [&_ul]:list-[revert]">
          <li>
            Sous-liste :
            <ul>
              <li>item</li>
              <li>item</li>
            </ul>
          </li>
          <li>
            Sous-liste :
            <ul>
              <li>item</li>
              <li>item</li>
            </ul>
          </li>
        </ul>
        <h2>Titre 2</h2>
        <h3>Sous-titre</h3>
        <p>Lorem ipsum</p>
        <h3>Sous-titre</h3>
        <p>Lorem ipsum</p>
        <hr className="mt-12 mb-6" />
      </div>
      <div className="w-full flex justify-end">
        <Button priority="primary" linkProps={{ href: "/cgu" }}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
