module View exposing (layout)

import Html.Styled exposing (a, button, div, form, h1, img, input, label, nav, node, span, text)
import Html.Styled.Attributes exposing (action, alt, attribute, class, for, href, id, method, name, placeholder, src, type_)
import Html.Styled.Events exposing (onInput)
import View.Icons as Icons


layout : { onFilter : String -> msg } -> Html.Styled.Html msg -> Html.Styled.Html msg
layout config content =
    div
        [ class "bg-gray-100 h-screen" ]
        [ div
            -- TODO: Implement open/close mobile menu
            [ class "hidden fixed inset-0 flex z-40 md:hidden", attribute "role" "dialog", attribute "aria-modal" "true" ]
            [ div
                [ class "fixed inset-0 bg-gray-600 bg-opacity-75", attribute "aria-hidden" "true" ]
                []
            , div
                [ class "relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white" ]
                [ div
                    [ class "absolute top-0 right-0 -mr-12 pt-2" ]
                    [ button
                        [ type_ "button", class "ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" ]
                        [ span
                            [ class "sr-only" ]
                            [ text "Close sidebar" ]
                        , Icons.close
                        ]
                    ]
                , div
                    [ class "flex-shrink-0 flex items-center px-4" ]
                    [ img
                        [ class "h-8 w-auto", src "/illustrations/beta-gouv-logo-a3.png", alt "BetaGouv - Reva" ]
                        []
                    , text "REVA"
                    ]
                , div
                    [ class "mt-5 flex-1 h-0 overflow-y-auto" ]
                    [ nav
                        [ class "px-2 space-y-1" ]
                        [ a
                            [ href "#", class "bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md" ]
                            [ Icons.candidats
                            , text "Candidats"
                            ]
                        ]
                    ]
                ]
            , div
                [ class "flex-shrink-0 w-14", attribute "aria-hidden" "true" ]
                []
            ]
        , div
            [ class "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0" ]
            [ div
                [ class "flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto" ]
                [ div
                    [ class "flex items-start flex-shrink-0 px-4" ]
                    [ img
                        [ class "h-10 w-auto", src "/illustrations/beta-gouv-logo-a3.png", alt "BetaGouv - Reva" ]
                        []
                    , span [ class "font-bold ml-2" ] [ text "REVA" ]
                    ]
                , div
                    [ class "mt-5 flex-grow flex flex-col" ]
                    [ nav
                        [ class "flex-1 px-2 pb-4 space-y-1" ]
                        [ a
                            [ href "#", class "bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md" ]
                            [ Icons.candidats
                            , text "Candidats"
                            ]
                        ]
                    ]
                ]
            ]
        , div
            [ class "md:pl-64 flex flex-col flex-1" ]
            [ div
                [ class "sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow" ]
                [ button
                    [ type_ "button", class "px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden" ]
                    [ span
                        [ class "sr-only" ]
                        [ text "Open sidebar" ]
                    , Icons.menu
                    ]
                , div
                    [ class "flex-1 px-4 flex justify-between" ]
                    [ div
                        [ class "flex-1 flex" ]
                        [ form
                            [ class "w-full flex md:ml-0", action "#", method "GET" ]
                            [ label
                                [ for "search-field", class "sr-only" ]
                                [ text "Rechercher" ]
                            , div
                                [ class "relative w-full text-gray-400 focus-within:text-gray-600" ]
                                [ div
                                    [ class "absolute inset-y-0 left-0 flex items-center pointer-events-none" ]
                                    [ Icons.search ]
                                , input
                                    [ id "search-field"
                                    , class "block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                    , placeholder "Rechercher un nom, un diplôme, une cohorte, une région..."
                                    , type_ "search"
                                    , name "search"
                                    , onInput config.onFilter
                                    ]
                                    []
                                ]
                            ]
                        ]
                    , div
                        [ class "ml-4 flex items-center md:ml-6" ]
                        []
                    ]
                ]
            , node "main"
                [ class "flex-1 bg-gray-100 h-full" ]
                [ div
                    [ class "py-6" ]
                    [ div
                        [ class "max-w-7xl mx-auto px-4 sm:px-6 md:px-8" ]
                        [ h1
                            [ class "text-2xl font-semibold text-gray-900" ]
                            [ text "Candidats" ]
                        ]
                    , div
                        [ class "max-w-7xl mx-auto px-4 sm:px-6 md:px-8" ]
                        [ div
                            [ class "py-4" ]
                            [ content ]
                        ]
                    ]
                ]
            ]
        ]
