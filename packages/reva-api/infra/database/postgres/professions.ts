import { Profession } from "../../../domains/search";

export const findProfessionsByQuery = ({ query }: { query: string; }): Promise<Profession[]> => {
  return Promise.resolve([
    {
      id: "uuid_prof_1",
      title: "profession 1",
      description: "description profession 1"
    },
    {
      id: "uuid_prof_2",
      title: "profession 2",
      description: "description profession 2"
    },
    {
      id: "uuid_prof_3",
      title: "profession 3",
      description: "description profession 3"
    }
  ]);
};
