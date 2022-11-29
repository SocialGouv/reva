module Data.Organism exposing (Organism)


type alias Organism =
    { id : String
    , label : String
    , address : String
    , zip : String
    , city : String
    , contactAdministrativeEmail : String
    }
