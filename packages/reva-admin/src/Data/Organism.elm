module Data.Organism exposing (Organism, OrganismInformationsCommerciales)

import Admin.Enum.OrganismTypology exposing (OrganismTypology)


type alias Organism =
    { id : String
    , label : String
    , contactAdministrativeEmail : String
    , typology : OrganismTypology
    , informationsCommerciales : Maybe OrganismInformationsCommerciales
    }


type alias OrganismInformationsCommerciales =
    { id : String
    , nom : Maybe String
    , emailContact : Maybe String
    }
