import {
  loremIpsum,
  loremIpsumLong,
  loremIpsumVeryLong,
} from "../components/atoms/LoremIpsum";
import { Certificate } from "../interface";

export const demoDescription = `<p>${loremIpsum}</p> <h2>Activité</h2><p>${loremIpsum}</p> <h2>Compétence</h2><p>${loremIpsum}</p> <h2>Secteurs d'activités</h2><p>${loremIpsum}</p> <h2>Types d'emplois accessibles</h2><p>${loremIpsum}</p>`;

export const certificateFixtures: Certificate[] = [
  {
    id: "1",
    description: demoDescription,
    label: "5983",
    summary: loremIpsum,
    title: "Surveillant - visiteur de nuit en secteur social et médico-social",
  },
  {
    id: "2",
    description: demoDescription,
    label: "13905",
    summary: loremIpsum,
    title: "Services aux personnes et aux territoires",
  },
  {
    id: "3",
    description: demoDescription,
    label: "35028",
    summary: loremIpsum,
    title: "Agent de service médico-social",
  },
  {
    id: "4",
    description: demoDescription,
    label: "35830",
    summary: loremIpsum,
    title: "Aide-Soignant",
  },
  {
    id: "5",
    description: demoDescription,
    label: "34692",
    summary: loremIpsum,
    title: "Employé familial",
  },
  {
    id: "6",
    description: demoDescription,
    label: "35506",
    summary: loremIpsum,
    title: "Assistant de vie aux familles",
  },
  {
    id: "7",
    description: demoDescription,
    label: "34690",
    summary: loremIpsum,
    title: "Assistant de vie dépendance",
  },
  {
    id: "8",
    description: demoDescription,
    label: "25467",
    summary: loremIpsum,
    title: "Diplôme d'État d'accompagnant éducatif et social",
  },
  {
    id: "9",
    description: demoDescription,
    label: "17163",
    summary: loremIpsum,
    title: "Conducteur-e accompagnateur-e de personnes à mobilité réduite",
  },
  {
    id: "10",
    description: demoDescription,
    label: "35993",
    summary: loremIpsum,
    title: "Responsable coordonnateur service au domicile",
  },
  {
    id: "11",
    description: demoDescription,
    label: "34691",
    summary: loremIpsum,
    title: "Assistant maternel / garde d'enfants",
  },
  {
    id: "12",
    description: demoDescription,
    label: "4500",
    summary: loremIpsum,
    title: "Assistant familial",
  },
  {
    id: "13",
    description: demoDescription,
    label: "35832",
    summary: loremIpsum,
    title: "Auxiliaire de puériculture",
  },
  {
    id: "14",
    description: loremIpsumLong,
    label: "4503",
    summary: loremIpsumLong,
    title: "Technicien de l'intervention sociale et familiale",
  },
  {
    id: "15",
    description: loremIpsumVeryLong,
    label: "2514",
    summary: loremIpsumVeryLong,
    title:
      "Certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale",
  },
];
