"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useId } from "react";

import { useUserDropdown } from "./useUserDropdown";

export const UserDropdown = () => {
  const { displayName, logout } = useUserDropdown();
  const id = useId();
  const menuId = `dropdown-user-menu-${id}`;

  return (
    <div className="fr-translate fr-nav mx-0" data-fr-js-navigation="true">
      <div className="fr-nav__item">
        <Button
          aria-controls={menuId}
          aria-expanded="false"
          title={displayName || "Mon compte"}
          iconId="ri-account-circle-line"
          className="fr-translate__btn before:content-none mb-0 px-2 mx-0 lg:mx-2"
        >
          {displayName || "Mon compte"}
        </Button>
        <div
          className="fr-collapse fr-menu right-2"
          id={menuId}
          data-fr-js-collapse="true"
        >
          <ul className="fr-menu__list">
            <li>
              <button className="fr-nav__link" onClick={logout}>
                Se déconnecter
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
