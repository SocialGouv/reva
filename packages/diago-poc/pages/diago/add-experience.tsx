import { useRouter } from "next/router";
import { useCallback } from "react";
import { Button } from "../../components/button/Button";
import { CompetencyCard } from "../../components/competency-card/CompetencyCard";
import { useMainImportContext } from "../../components/main-context/MainContext";

const AddExperiencePage = () => {
  const router = useRouter();
  const { userInfos } = useMainImportContext();

  const handleShowDiagnosisButtonClick = useCallback(async () => {
    router.push("/diago/show-diagnosis");
  }, [router]);

  return (
    <div className="h-full flex flex-col py-12">
      <div className="flex-none">
        <Button
          onClick={() => router.push("/diago/add-competencies")}
          label= "Ajouter une expérience"
          size="large" 
        />
        {!!userInfos.professionAndCompetencies.length && (
          <div className="flex-none">
          <div className="mt-4">
            <Button
              onClick={handleShowDiagnosisButtonClick}
              label= "Voir mon diagnostic"
              size="large" 
              />
          </div>
        </div>)}
      </div>
      {!!userInfos.professionAndCompetencies.length && <p className="text-lg font-semibold mt-12">Vos expériences</p>}
      <div className="flex-1 flex flex-col space-y-8 mt-6">
      {userInfos.professionAndCompetencies.map((pAndC, i) => (
        <div key={pAndC.profession?.id} className="py-4">
          <p className="text-sm font-semibold text-gray-800">{pAndC.profession?.label}</p>
          <div className="flex flex-col space-y-4 mt-4">
            {pAndC.competencies.map((c) => 
              (<CompetencyCard key={c.code_ogr} competency={c} isSelected={false} />)
            )}
          </div>          
        </div>
      ))}
      </div>
    </div>
  );
};

export default AddExperiencePage;
