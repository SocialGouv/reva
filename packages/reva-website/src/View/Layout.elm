module View.Layout exposing (layoutHeader, view)

import Html.Styled exposing (a, button, div, header, node, span, text)
import Html.Styled.Attributes exposing (attribute, class, href, type_)
import Html.Styled.Events exposing (onClick)
import Machine.Menu exposing (State(..))
import View.Icons as Icons


view : { a | onOpenMobileMenu : msg, mobileMenu : State, onCloseMobileMenu : msg } -> List (Html.Styled.Html msg) -> Html.Styled.Html msg
view config body =
    div
        [ class "bg-white z-20 pt-20" ]
        [ layoutHeader config
        , mobileMenu config
        , node
            "main"
            [ class "max-w-7xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:px-8"
            , class "bg-white"
            ]
            [ div [] body ]
        ]


layoutHeader : { a | onOpenMobileMenu : msg } -> Html.Styled.Html msg
layoutHeader config =
    header
        []
        [ div
            [ class "bg-white border-b fixed top-0 inset-x-0 z-50" ]
            [ div
                [ class "max-w-7xl mx-auto px-4 py-2 sm:px-6 md:space-x-10"
                , class "flex justify-between items-center md:justify-start"
                ]
                [ div
                    [ class "flex justify-start lg:w-0 lg:flex-1" ]
                    [ a
                        [ class "font-semibold"
                        , class "rounded"
                        , class "px-4 py-2 my-2 bg-gray-100"
                        , href "/"
                        ]
                        [ text "REVA - Valoriser les compétences"
                        ]
                    ]
                , div
                    [ class "md:hidden" ]
                    [ button
                        [ onClick config.onOpenMobileMenu
                        , type_ "button"
                        , class "text-gray-400 hover:text-gray-500"
                        , class "inline-flex items-center justify-center"
                        , class "bg-white rounded-md p-2 hover:bg-gray-100"
                        , attribute "aria-expanded" "false"
                        ]
                        [ span
                            [ class "sr-only" ]
                            [ text "Ouvrir le menu" ]
                        , Icons.menu
                        ]
                    ]
                , div
                    [ class "hidden md:flex items-center justify-end" ]
                    [ a
                        [ href "/mentions-legales"
                        , class "whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                        ]
                        [ text "Mentions Légales" ]
                    ]
                ]
            ]
        ]


mobileMenu : { a | mobileMenu : State, onCloseMobileMenu : msg } -> Html.Styled.Html msg
mobileMenu config =
    div
        [ if config.mobileMenu == Machine.Menu.Opened then
            class "duration-200 ease-out opacity-100 scale-100"

          else
            class "pointer-events-none duration-100 ease-out opacity-0 scale-95"
        , class
            "fixed z-50 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
        ]
        [ div
            [ class "rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white" ]
            [ div
                [ class "p-2" ]
                [ div
                    [ class "flex items-center justify-end" ]
                    [ div
                        []
                        [ button
                            [ onClick config.onCloseMobileMenu
                            , type_ "button"
                            , class "text-gray-400 hover:text-gray-500 "
                            , class "bg-white hover:bg-gray-100"
                            , class "rounded-md p-2 inline-flex items-center justify-center"
                            ]
                            [ span
                                [ class "sr-only" ]
                                [ text "Fermer le menu" ]
                            , Icons.close
                            ]
                        ]
                    ]
                ]
            , div
                [ class "py-6 px-5" ]
                [ div
                    []
                    [ a
                        [ href "https://reva.beta.gouv.fr/app/"
                        , class "text-base font-medium hover:bg-gray-100"
                        , class "px-4 py-2 border rounded-md shadow-sm"
                        , class "w-full flex items-center justify-center"
                        ]
                        [ text "Se connecter" ]
                    ]
                ]
            ]
        ]
