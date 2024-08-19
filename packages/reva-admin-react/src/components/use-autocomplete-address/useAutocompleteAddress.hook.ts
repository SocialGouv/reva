import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface AddressOption {
  label: string;
  street: string;
  zip: string;
  city: string;
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
      type: string;
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
      const result = data.features.map((feature: any) => {
        return {
          label: feature.properties.label,
          street: feature.properties.name,
          zip: feature.properties.postcode,
          city: feature.properties.city,
        };
      });
      return result;
    },
    enabled: !!debouncedSearch,
  });
}
