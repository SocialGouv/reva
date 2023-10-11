module Data.Account exposing (Account, AccountSummaryPage)

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
    , organismId : Maybe String
    , certificationAuthorityId : Maybe String
    }
