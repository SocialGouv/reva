import { useCallback, useEffect, useState } from "react";
import {
  useFCCertificationQuery,
  useFormacodeQuery,
} from "../certificationQueries";
import { FcCertification, Formacode } from "@/graphql/generated/graphql";

export const CertificationFormacodes = ({
  codeRncp,
}: {
  codeRncp: string;
}): React.ReactNode => {
  const { getFCCertification } = useFCCertificationQuery();
  const { getFormacodes } = useFormacodeQuery();

  const [fcCertification, setFcCertification] = useState<FcCertification>();
  const [formacodes, setFormacodes] = useState<Formacode[]>();

  const loadData = useCallback(async () => {
    const certitifcation = await getFCCertification(codeRncp);
    if (certitifcation) {
      setFcCertification(certitifcation);
    }

    const codes = await getFormacodes();
    setFormacodes(codes);
  }, [codeRncp, getFCCertification, getFormacodes]);

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!fcCertification || !formacodes) return null;

  const getFormacodeByCode = (code: string): Formacode | undefined => {
    return formacodes.find((formacode) => formacode.code == code);
  };

  const getParent = (child: Formacode) => {
    return formacodes.find((formacode) => formacode.code == child.parentCode);
  };

  const getParents = (formacode: Formacode): Formacode[] => {
    const parent = getParent(formacode);

    if (parent) {
      return [...getParents(parent), formacode];
    }

    return [formacode];
  };

  return (
    <div>
      {fcCertification.FORMACODES.map((FORMACODE) => {
        const formacode = getFormacodeByCode(FORMACODE.CODE);

        return (
          <div key={FORMACODE.CODE}>
            {FORMACODE.CODE} {FORMACODE.LIBELLE}
            {formacode && (
              <p>
                {getParents(formacode).map((formacode, index) => (
                  <span key={formacode.code}>
                    {index != 0 && " -> "}
                    {formacode.code} {formacode.label}
                  </span>
                ))}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
