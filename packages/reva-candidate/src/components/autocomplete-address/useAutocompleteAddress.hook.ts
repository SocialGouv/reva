import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "../graphql/graphql-client/GraphqlClient";

export interface AddressOption {
  id: string;
  label: string;
  street: string;
  zip: string;
  city: string;
  type: "housenumber" | "street" | "municipality" | "locality";
}

type AutocompleteAddressResponse = {
  type: string;
  version: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties: {
      label: string;
      score: number;
      housenumber?: string;
      id: string;
      banId?: string;
      name: string;
      postcode: string;
      citycode: string;
      x: number;
      y: number;
      city: string;
      district?: string;
      context: string;
      type: AddressOption["type"];
      importance: number;
      street: string;
    };
  }>;
  attribution: string;
  licence: string;
  query: string;
  limit: number;
};

export function useAutocompleteAddress({ search }: { search?: string }) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  return useQuery<AddressOption[]>({
    queryKey: ["autocomplete-address", debouncedSearch],
    queryFn: async () => {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${debouncedSearch}&limit=10`,
      );
      const data: AutocompleteAddressResponse = await response.json();
      if (!data.features.length) {
        return [];
      }
      const result = data.features.map((feature) => {
        return {
          id: feature.properties.id,
          label: feature.properties.label,
          street: feature.properties.name,
          zip: feature.properties.postcode,
          city: feature.properties.city,
          type: feature.properties.type,
        };
      });
      return result;
    },
    enabled: !!debouncedSearch,
  });
}

const getDepartments = graphql(`
  query getDepartments {
    getDepartments {
      id
      label
      code
    }
  }
`);

export function useDepartments() {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => graphqlClient.request(getDepartments),
  });

  const departments = data?.getDepartments;

  return {
    departments,
  };
}
