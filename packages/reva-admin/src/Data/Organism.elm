module Data.Organism exposing (Organism, OrganismId, organismIdFromUuid, organismIdToString)

import Admin.Scalar exposing (Uuid(..))


type OrganismId
    = OrganismId String


type alias Organism =
    { id : OrganismId
    , label : String
    , address : String
    , zip : String
    , city : String
    , contactAdministrativeEmail : String
    }


organismIdFromUuid : Uuid -> OrganismId
organismIdFromUuid (Uuid id) =
    OrganismId id


organismIdToString : OrganismId -> String
organismIdToString (OrganismId id) =
    id
