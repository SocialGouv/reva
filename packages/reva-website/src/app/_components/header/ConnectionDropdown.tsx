"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useId } from "react";

export const ConnectionDropdown = () => {
  const id = useId();
  const menuId = `dropdown-connection-menu-${id}`;

  // We use the fr-translate* classes to inherit the opened/closed chevron icon
  // and remove the translate icon with content-none.
  return (
    <div className="fr-translate fr-nav mx-0" data-fr-js-navigation="true">
      <div className="fr-nav__item">
        <Button
          aria-controls={menuId}
          aria-expanded="false"
          title="Se connecter"
          className="fr-translate__btn before:content-none mb-0 px-2 mx-0 lg:mx-2"
        >
          Se connecter
        </Button>
        <div
          className="fr-collapse fr-menu"
          id={menuId}
          data-fr-js-collapse="true"
        >
          <ul className="fr-menu__list w-[280px]">
            <li>
              <a className="fr-nav__link" href="/candidat/login">
                Candidat
              </a>
            </li>
            <li>
              <a className="fr-nav__link" href="/admin2">
                Professionnels de la VAE
              </a>
            </li>
            <li>
              <a className="fr-nav__link" href="/vae-collective">
                Porteur de projet VAE collective
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
