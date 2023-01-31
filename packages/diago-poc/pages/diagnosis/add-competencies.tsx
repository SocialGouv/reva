import { useQuery } from "@tanstack/react-query";
import { SyntheticEvent, useCallback, useReducer, useState } from "react";
import { Competency, Profession, ProfessionAndCompetencies } from "../../types/types";
import { useRouter } from "next/router";
import { useMainImportContext } from "../../components/main-context/MainContext";
import { Select } from "../../components/select/Select";
import { Button } from "../../components/button/Button";
import { CompetencyCard } from "../../components/competency-card/CompetencyCard";

const professionAndCompetenciesReducer = (
  state: ProfessionAndCompetencies,
  action:
    | { type: "set_job"; payload: Profession }
    | { type: "check_competency"; payload: Competency | undefined }
) => {
  let newState = { ...state };
  switch (action.type) {
    case "set_job":
      newState = { profession: action.payload, competencies: [] };
      break;
    case "check_competency":
      if (!action.payload) {
        return state
      }
      let competencies = [...state.competencies];

      if (competencies.find(c => c.code_ogr === action.payload?.code_ogr)) {
        competencies = competencies.filter(c => c.code_ogr !== action.payload?.code_ogr)
      } else {
        competencies.push(action.payload)
      }
      newState = { ...state, competencies };
      break;
  }
  return newState;
};

const AddCompetenciesPage = () => {
  const router = useRouter();
  const { userInfos, updateUserInfos } = useMainImportContext();

  const [professionAndCompetencies, dispatchProfessionAndCompetenciesEvent] = useReducer(
    professionAndCompetenciesReducer,
    { profession: null, competencies: [] }
  );

  const { data: professionsData } = useQuery<Profession[]>({
    queryKey: ["professions"],
    queryFn: async () => (await fetch("/api/professions")).json(),
  });

  const { data: competenciesData } = useQuery<Competency[]>({
    queryKey: ["competencies", professionAndCompetencies.profession?.id],
    queryFn: async () =>
      (
        await fetch(
          "/api/activities?" +
            new URLSearchParams({ professionId: (professionAndCompetencies.profession?.id as string | undefined) || "" })
        )
      ).json(),
    enabled: !!professionAndCompetencies.profession?.id,
  });

  const handleSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      updateUserInfos({
        ...userInfos,
        professionAndCompetencies: [
          ...userInfos.professionAndCompetencies,
          professionAndCompetencies,
        ],
      });
      router.push("/diagnosis/add-experience");
    },
    [professionAndCompetencies, router, updateUserInfos, userInfos]
  );

  return (
    <div className="h-full flex flex-col py-12">
      <h1 className="text-lg font-semibold">Nouvelle expérience</h1>

      <Select 
        className="mt-4"
        name="profession"
        label="Veuillez sélectionner un métier"
        options={professionsData?.map(p => ({label: p.label, value: `${p.id}`})) || []}
        onChangeHandler={(e) =>
          dispatchProfessionAndCompetenciesEvent({
            type: "set_job",
            payload: professionsData?.find(
              (p) => {
                // @ts-ignore
                return `${p.id}` === e.target.value
              }
            ) as Profession,
          })
        }
      />

      {!!competenciesData?.length && (<div className="mt-12">
        <p>Quelles compétences avez-vous ?</p>
        <div className="flex flex-col space-y-4 mt-4">
          {competenciesData?.map((c, idx) => (
              <CompetencyCard 
                key={c.code_ogr}
                competency={c}
                isSelected={professionAndCompetencies.competencies.includes(c)}
                onToggle={(v) => dispatchProfessionAndCompetenciesEvent({
                  type: "check_competency",
                  payload: competenciesData.find(c => `${c.code_ogr}` === v.target.value),
                })
              }
              />
          ))}
        </div>
      </div>)}

      {!!professionAndCompetencies.profession && <div>
        <form className="m-12" onSubmit={handleSubmit}>
            <Button
              type="submit"
              label= "Enregistrer"
              size="large" 
            />
        
        </form>
      </div>}
      
    </div>
  );
};

export default AddCompetenciesPage;
