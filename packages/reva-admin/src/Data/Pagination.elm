module Data.Pagination exposing (..)


type alias PaginationInfo =
    { totalRows : Int
    , currentPage : Int
    , totalPages : Int
    , pageLength : Int
    }
