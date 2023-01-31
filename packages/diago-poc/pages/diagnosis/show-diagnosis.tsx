import { Flex, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { SyntheticEvent, useCallback, useEffect } from "react";
import { Button } from "../../components/button/Button";
import { CertificationCard } from "../../components/certification-card/CertificationCard";
import { CompetencyCard } from "../../components/competency-card/CompetencyCard";
import { useMainImportContext } from "../../components/main-context/MainContext";
import { CertificationWithPurcentMatch } from "../../types/types";

const ShowDiagnosisPage = () => {
  const router = useRouter();
  const { userInfos, updateUserInfos, computeDiagnosis } = useMainImportContext();

  const competenciesCodeOgrs = 
    userInfos.professionAndCompetencies.reduce((memo, pAc) => {
      const ids = pAc.competencies.map(c => `${c.code_ogr}`)
      return [...memo, ...ids]
    }, [] as string[]);


  const { data: certificationsData } = useQuery<CertificationWithPurcentMatch[]>({
    queryKey: ["certifications", competenciesCodeOgrs.join('-')],
    queryFn: async () => {
      const result = await (await fetch(
        "/api/diagnosis?" +
          new URLSearchParams(
            competenciesCodeOgrs.map(c => ['activitiesCodeOgrs', c])
          )
      )).json()
      updateUserInfos({
        ...userInfos,
        diagnosis: (result as CertificationWithPurcentMatch[]) || [],
      });

      return result
    } 
  });

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault()
      await computeDiagnosis()
      router.push("/diagnosis/thank-you");
    },
    [router, computeDiagnosis]
  );
  
  return (
    <div className="h-full flex flex-col py-12">
      <h1 className="text-lg font-semibold">Votre diagnostique</h1>
      <p className="text-sm font-light mt-2">Voici la liste des certifications correspondant aux compétences que vous avez sélectionnées.</p>

      <div className="flex flex-col mt-4 space-y-4">
        {certificationsData?.map((c) => (<CertificationCard key={c.id} certification={c}/>))}
      </div>
      <div className="mt-12">
      <form className="m-12" onSubmit={handleSubmit}>
          <Button
            type="submit"
            label= "Enregistrer diagnostic"
            size="large" 
            />
      </form>
      </div>
    </div>
  );
};

export default ShowDiagnosisPage;
