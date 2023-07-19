module Data.Organism exposing (Organism)

import Admin.Enum.OrganismTypology exposing (OrganismTypology)


type alias Organism =
    { id : String
    , label : String
    , address : String
    , zip : String
    , city : String
    , contactAdministrativeEmail : String
    , typology : OrganismTypology
    }
