import { FC } from "react";

import { Header } from "../../atoms/Header";

interface Props {
  codeRncp: string;
  title: string;
  candidacyCreatedAt?: Date;
}

export const PageHeaders: FC<Props> = ({
  codeRncp,
  title: label,
  candidacyCreatedAt,
}) => {
  return (
    <>
      <Header color="dark" label={label} level={2} size="small" />
      <div className="-mt-2 mb-2 font-bold">{codeRncp}</div>
      {!!candidacyCreatedAt ? (
        <div className="text-sm text-gray-400" data-test="created-at-date">
          Démarré le {candidacyCreatedAt.toLocaleDateString("fr-FR")}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
