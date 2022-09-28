import { FC } from "react";

import { Header } from "../../atoms/Header";

interface Props {
  codeRncp: string;
  title: string;
  startDated: Date;
}

export const PageHeaders: FC<Props> = ({
  codeRncp,
  title: label,
  startDated,
}) => {
  return (
    <>
      <Header color="dark" label={label} level={2} size="small" />
      <div className="-mt-2 mb-2 font-bold">{codeRncp}</div>
      <p className="text-sm text-gray-400">
        Démarré le {startDated.toLocaleDateString("fr-FR")}
      </p>
    </>
  );
};
