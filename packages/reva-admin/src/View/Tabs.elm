module View.Tabs exposing (view)

import Accessibility exposing (Html, a, div, li, text, ul)
import Accessibility.Aria as Aria
import Html.Attributes exposing (class, href, tabindex)
import Html.Attributes.Extra exposing (role)


type alias Tab =
    { isActive : Bool
    , href : String
    , label : String
    }


view tabs content =
    div [ class "fr-tabs mb-8" ]
        [ viewTabs tabs
        , div
            [ class "fr-tabs__panel fr-tabs__panel--selected"
            , class "mt-[-1px] pb-0"
            , class "border border-[#d5d5d5]"
            ]
            content
        ]


viewTabs tabs =
    ul
        [ class "fr-tabs__list"
        , role "tablist"
        ]
    <|
        List.map viewTab tabs


viewTab : Tab -> Html msg
viewTab tab =
    li [ role "presentation" ]
        [ a
            [ class "fr-tabs__tab"
            , tabindex <|
                if tab.isActive then
                    0

                else
                    -1
            , role "tab"
            , Aria.selected tab.isActive
            , href tab.href
            ]
            [ text tab.label ]
        ]
