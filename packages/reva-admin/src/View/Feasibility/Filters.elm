module View.Feasibility.Filters exposing (..)

import Admin.Enum.FeasibilityCategoryFilter as FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Data.Context exposing (Context)
import Data.Feasibility exposing (FeasibilityCountByCategory, feasibilityCategoryFilterToReadableString)
import Html exposing (Html, a, label, li, text, ul)
import Html.Attributes exposing (class, classList)
import Route exposing (FeasibilityFilters)


view :
    FeasibilityCountByCategory
    -> FeasibilityFilters
    -> Context
    -> List (Html msg)
view feasibilityCountByCategory filters context =
    let
        count category =
            case category of
                _ ->
                    feasibilityCountByCategory.all

        link category label =
            viewLink context filters (count category) category label

        viewFilter : FeasibilityCategoryFilter -> Html msg
        viewFilter category =
            link category (feasibilityCategoryFilterToReadableString category)
    in
    [ ul
        [ class "font-semibold text-gray-900 py-2"
        , class "fr-sidemenu__list"
        ]
        [ viewFilter FeasibilityCategoryFilter.All
        ]
    ]


viewLink : Context -> FeasibilityFilters -> Int -> FeasibilityCategoryFilter -> String -> Html msg
viewLink context filters count categoryFilter label =
    let
        isSelected =
            filters.category == categoryFilter
    in
    li
        []
        [ a
            [ class "block group my-4 py-1 px-2"
            , class "flex items-start justify-between transition"
            , class "border-l-2 border-transparent"
            , classList
                [ ( "text-blue-900 border-blue-900"
                  , isSelected
                  )
                , ( "hover:text-blue-900"
                  , not isSelected
                  )
                ]
            , Route.href context.baseUrl <|
                Route.Feasibilities { category = categoryFilter, page = 1 }
            ]
            [ text label, viewCount count ]
        ]


viewCount : Int -> Html msg
viewCount count =
    text <| String.concat [ " (", String.fromInt count, ")" ]
