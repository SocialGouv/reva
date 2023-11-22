module Data.Account exposing (Account, AccountSummaryPage)

import Data.CertificationAuthority exposing (CertificationAuthority)
import Data.Organism exposing (Organism)
import Data.Pagination exposing (PaginationInfo)


type alias AccountSummaryPage =
    { rows : List Account
    , info : PaginationInfo
    }


type alias Account =
    { id : String
    , keycloakId : String
    , email : String
    , firstname : Maybe String
    , lastname : Maybe String
    , organism : Maybe Organism
    , certificationAuthority : Maybe CertificationAuthority
    }
