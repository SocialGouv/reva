module Data.Pagination exposing (..)

import Admin.Object exposing (PaginationInfo)


type alias PaginationInfo =
    { totalRows : Int
    , currentPage : Int
    , totalPages : Int
    , pageLength : Int
    }
