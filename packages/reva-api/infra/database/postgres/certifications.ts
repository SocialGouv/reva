import type { Certification } from "../../../domains/search";

export const findCertificationsByQuery = ({ query }: { query: string; }): Promise<Certification[]> => {
  return Promise.resolve([
    {
      id: "uuid_cert_1",
      title: "certification 1",
      description: "description certification 1"
    },
    {
      id: "uuid_cert_2",
      title: "certification 2",
      description: "description certification 2"
    },
    {
      id: "uuid_cert_3",
      title: "certification 3",
      description: "description certification 3"
    }
  ]);
};
