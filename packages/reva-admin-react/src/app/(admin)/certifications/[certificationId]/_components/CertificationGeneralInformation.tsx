import { ReactNode, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useFCCertificationQuery } from "../certificationQueries";
import { FcCertification } from "@/graphql/generated/graphql";

export const CertificationGeneralInformation = ({
  codeRncp,
}: {
  codeRncp: string;
}): React.ReactNode => {
  const { getFCCertification } = useFCCertificationQuery();

  const [fcCertification, setFcCertification] = useState<FcCertification>();

  const loadData = useCallback(async () => {
    const certitifcation = await getFCCertification(codeRncp);
    if (certitifcation) {
      setFcCertification(certitifcation);
    }
  }, [codeRncp, getFCCertification]);

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!fcCertification) return null;

  return (
    <div>
      <Info title="Intitulé de la certification">
        {fcCertification.INTITULE}
      </Info>
      <div className="grid grid-cols-2">
        <Info title="Niveau de la certification">
          {fcCertification.NOMENCLATURE_EUROPE.INTITULE}
        </Info>
        <Info title="Type de la certification">
          {fcCertification.ABREGE.LIBELLE} ({fcCertification.ABREGE.CODE})
        </Info>
        <Info title="Date fin enregistrement">
          {format(fcCertification.DATE_FIN_ENREGISTREMENT, "dd/MM/yyyy")}
        </Info>
        <Info title="Date limite délivrance">
          {fcCertification.DATE_LIMITE_DELIVRANCE
            ? format(fcCertification.DATE_LIMITE_DELIVRANCE, "dd/MM/yyyy", {
                locale: fr,
              })
            : "Inconnue"}
        </Info>
      </div>
    </div>
  );
};

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className}`}>
    <dt className="font-normal text-sm text-gray-600 mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);
