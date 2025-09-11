import { RemoteZone } from "@/graphql/generated/graphql";

export const getRemoteZoneLabel = (remoteZone: RemoteZone) => {
  switch (remoteZone) {
    case "FRANCE_METROPOLITAINE":
      return "France métropolitaine (UTC+2)";
    case "GUADELOUPE":
      return "Guadeloupe (UTC-4)";
    case "GUYANE":
      return "Guyane (UTC-3)";
    case "LA_REUNION":
      return "La Réunion (UTC+4)";
    case "MARTINIQUE":
      return "Martinique (UTC-4)";
    case "MAYOTTE":
      return "Mayotte (UTC+3)";
    case "SAINTE_LUCIE_SAINT_MARTIN":
      return "Sainte-Lucie / Saint-Martin (UTC-4)";
    case "SAINT_PIERRE_ET_MIQUELON":
      return "Saint-Pierre-et-Miquelon (UTC-2)";
  }
};
