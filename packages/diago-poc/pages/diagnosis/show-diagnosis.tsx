import { Flex, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/button/Button";
import { CertificationCard } from "../../components/certification-card/CertificationCard";
import { CompetencyCard } from "../../components/competency-card/CompetencyCard";
import { useMainImportContext } from "../../components/main-context/MainContext";
import { CertificationWithPurcentMatch } from "../../types/types";

const ShowDiagnosisPage = () => {
  const { userInfos } = useMainImportContext();

  const competenciesIds = 
    userInfos.professionAndCompetencies.reduce((memo, pAc) => {
      const ids = pAc.competencies.map(c => `${c.id}`)
      return [...memo, ...ids]
    }, [] as string[]);


  const { data: certificationsData } = useQuery<CertificationWithPurcentMatch[]>({
    queryKey: ["certifications", competenciesIds.join('-')],
    queryFn: async () =>
      (
        await fetch(
          "/api/diagnosis?" +
            new URLSearchParams(
              competenciesIds.map(c => ['competenciesIds', c])
            )
        )
      ).json()
  });

  return (
    <div className="h-full flex flex-col py-12">
      <h1 className="text-lg font-semibold">Votre diagnostique</h1>

      <div className="flex flex-col mt-4 space-y-4">
        {certificationsData?.map((c) => 
          (<label key={c.id} className="relative flex bg-white p-4 shadow-sm focus:outline-none">
      
          <span className="flex flex-1">
            <span className="pr-2">
              <span id="project-type-0-label" className="block text-sm font-medium text-gray-900">{c.label}</span>
            </span>
          </span>
          <div className="flex justify-center items-center p-2 w-10 h-10 bg-indigo-500 rounded-full text-xs font-semibold text-white">
            {(c.purcent * 100).toFixed(0)}%
          </div>
          <span className="pointer-events-none absolute -inset-px border border-gray-200" aria-hidden="true"></span>
        </label>)
        )}
      </div>
      <div className="mt-12">
          <Button
            label= "Enregistrer diagnostic"
            size="large" 
            />
      </div>
    </div>
  );
};

export default ShowDiagnosisPage;
