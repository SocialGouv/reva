module Data.Organism exposing (Organism, OrganismInformationsCommerciales)

import Admin.Enum.OrganismTypology exposing (OrganismTypology)


type alias Organism =
    { id : String
    , label : String
    , address : String
    , zip : String
    , city : String
    , contactAdministrativeEmail : String
    , typology : OrganismTypology
    , informationsCommerciales : Maybe OrganismInformationsCommerciales
    }


type alias OrganismInformationsCommerciales =
    { id : String
    , nom : Maybe String
    }
