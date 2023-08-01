module Api.Pagination exposing (pageInfoSelection)

import Admin.Object
import Admin.Object.PaginationInfo
import Data.Pagination
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


pageInfoSelection : SelectionSet Data.Pagination.PaginationInfo Admin.Object.PaginationInfo
pageInfoSelection =
    SelectionSet.succeed Data.Pagination.PaginationInfo
        |> with Admin.Object.PaginationInfo.totalRows
        |> with Admin.Object.PaginationInfo.currentPage
        |> with Admin.Object.PaginationInfo.totalPages
        |> with Admin.Object.PaginationInfo.pageLength
