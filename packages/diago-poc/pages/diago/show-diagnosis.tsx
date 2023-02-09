import { Flex, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { SyntheticEvent, useCallback, useEffect } from "react";
import { Button } from "../../components/button/Button";
import { CertificationCard } from "../../components/certification-card/CertificationCard";
import { CompetencyCard } from "../../components/competency-card/CompetencyCard";
import { useMainImportContext } from "../../components/main-context/MainContext";
import { CertificationWithPurcentMatch } from "../../types/types";


interface CertificationsData {
  debug: {
    query: string;
    variables: unknown;
  },
  certifications: CertificationWithPurcentMatch[]
}

const ShowDiagnosisPage = () => {
  const router = useRouter();
  const { userInfos, updateUserInfos, computeDiagnosis } = useMainImportContext();

  const competenciesCodeOgrs = 
    userInfos.professionAndCompetencies.reduce((memo, pAc) => {
      const ids = pAc.competencies.map(c => `${c.code_ogr}`)
      return [...memo, ...ids]
    }, [] as string[]);

  const secteursRome = 
      userInfos.professionAndCompetencies.reduce((memo, pAc) => {
        const secteurs = pAc.competencies.map(c => `${c.secteur}`)
        return [...memo, ...secteurs]
      }, [] as string[]).reduce((memo, s) => {
        if (memo.includes(s)) {
          return memo
        }
        return [...memo, s]
      }, [] as string[]);


  const { data: certificationsData, isLoading, isSuccess } = useQuery<CertificationsData>({
    queryKey: ["certifications", competenciesCodeOgrs.join('-')],
    queryFn: async () => {
      const result = await (await fetch(
        "/api/diagnosis?" +
          new URLSearchParams(
            [
              ...competenciesCodeOgrs.map(c => ['activitiesCodeOgrs', c]),
              ...secteursRome.map(s => ['secteursRome', s]),
          ]
          ), {
            headers: {
              "X-target": "diago"
            }
          }
      )).json()
      updateUserInfos({
        ...userInfos,
        type: "diago",
        diagnosis: (result.certifications as CertificationWithPurcentMatch[]) || [],
      });

      return result
    } 
  });

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault()
      await computeDiagnosis()
      router.push("/diago/thank-you");
    },
    [router, computeDiagnosis]
  );
  
  return (
    <div className="h-full flex flex-col py-12">
      <h1 className="text-lg font-semibold">Votre diagnostic</h1>
      <p className="text-sm font-light mt-2">Voici la liste des certifications correspondant aux compétences que vous avez sélectionnées.</p>
      <details className="mt-4 text-gray-500 text-sm">
        <summary>API Diago</summary>
        <div>
          <div>query:</div>
          <p>{certificationsData?.debug.query.split("\n").map((l, idx) => (<div key={idx}>{l}</div>))}</p>
          <div className="mt-4">variables:</div>
          <p>{JSON.stringify(certificationsData?.debug.variables, null, 2)}</p>
        </div>
      </details>

      {isLoading && <div className="flex flex-col mt-4 space-y-4 items-center justify-center text-sm font-light">Chargement...</div>}
      {isSuccess && (<div className="flex flex-col mt-8">
        {certificationsData?.certifications.sort((c1, c2) => c1.purcent < c2.purcent ?  1 : (c1.purcent > c2.purcent ? -1 : 0)).map((c, index) => (<CertificationCard key={c.id} isLight={index > 4} certification={c}/>))}
      </div>)}
      <div className="mt-12">
      <form className="m-12" onSubmit={handleSubmit}>
          <Button
            disabled={!isSuccess}
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
