import {
  loremIpsum,
  loremIpsumLong,
  loremIpsumVeryLong,
} from "../components/atoms/LoremIpsum";
import { Certification } from "../interface";

export const demoDescription = `<p>${loremIpsum}</p> <h2>Activité</h2><p>${loremIpsum}</p> <h2>Compétence</h2><p>${loremIpsum}</p> <h2>Secteurs d'activités</h2><p>${loremIpsum}</p> <h2>Types d'emplois accessibles</h2><p>${loremIpsum}</p>`;

export const certificateFixtures: Certification[] = [
  {
    id: "1",
    description: demoDescription,
    codeRncp: "5983",
    summary: loremIpsum,
    label: "Surveillant - visiteur de nuit en secteur social et médico-social",
  },
  {
    id: "2",
    description: demoDescription,
    codeRncp: "13905",
    summary: loremIpsum,
    label: "Services aux personnes et aux territoires",
  },
  {
    id: "3",
    description: demoDescription,
    codeRncp: "35028",
    summary: loremIpsum,
    label: "Agent de service médico-social",
  },
  {
    id: "4",
    description: demoDescription,
    codeRncp: "35830",
    summary: loremIpsum,
    label: "Aide-Soignant",
  },
  {
    id: "5",
    description: demoDescription,
    codeRncp: "34692",
    summary: loremIpsum,
    label: "Employé familial",
  },
  {
    id: "6",
    description: demoDescription,
    codeRncp: "35506",
    summary: loremIpsum,
    label: "Assistant de vie aux familles",
  },
  {
    id: "7",
    description: demoDescription,
    codeRncp: "34690",
    summary: loremIpsum,
    label: "Assistant de vie dépendance",
  },
  {
    id: "8",
    description: demoDescription,
    codeRncp: "25467",
    summary: loremIpsum,
    label: "Diplôme d'État d'accompagnant éducatif et social",
  },
  {
    id: "9",
    description: demoDescription,
    codeRncp: "17163",
    summary: loremIpsum,
    label: "Conducteur-e accompagnateur-e de personnes à mobilité réduite",
  },
  {
    id: "10",
    description: demoDescription,
    codeRncp: "35993",
    summary: loremIpsum,
    label: "Responsable coordonnateur service au domicile",
  },
  {
    id: "11",
    description: demoDescription,
    codeRncp: "34691",
    summary: loremIpsum,
    label: "Assistant maternel / garde d'enfants",
  },
  {
    id: "12",
    description: demoDescription,
    codeRncp: "4500",
    summary: loremIpsum,
    label: "Assistant familial",
  },
  {
    id: "13",
    description: demoDescription,
    codeRncp: "35832",
    summary: loremIpsum,
    label: "Auxiliaire de puériculture",
  },
  {
    id: "14",
    description: loremIpsumLong,
    codeRncp: "4503",
    summary: loremIpsumLong,
    label: "Technicien de l'intervention sociale et familiale",
  },
  {
    id: "15",
    description: loremIpsumVeryLong,
    codeRncp: "2514",
    summary: loremIpsumVeryLong,
    label:
      "Certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale",
  },
];
