module Page.Candidates exposing (Candidate, Model, candidatesDecoder, init, receiveCandidates, view)

import Html.Styled exposing (Html, a, div, img, span, table, tbody, td, text, th, thead, tr)
import Html.Styled.Attributes exposing (alt, class, href, scope, src)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Page.Login exposing (Model)


type Model
    = Loading
    | Idle (List Candidate)


type alias Candidate =
    { email : String
    , firstname : String
    , lastname : String
    , diplome : Maybe Diplome
    , cohorte : Maybe Cohorte
    }


type alias Cohorte =
    { id : String
    , label : String
    , region : String
    }


type alias Diplome =
    { id : String
    , label : String
    }


init : Model
init =
    Loading


receiveCandidates : List Candidate -> Model
receiveCandidates candidates =
    Idle candidates



-- VIEW


view : Model -> Html msg
view model =
    case model of
        Loading ->
            div [] [ text "loading" ]

        Idle candidates ->
            viewCandidates candidates


viewCandidates : List Candidate -> Html msg
viewCandidates candidates =
    div [ class "flex justify-center py-8" ]
        [ div [ class "flex flex-col max-w-screen-lg" ]
            [ div [ class "-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8" ]
                [ div [ class "py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8" ]
                    [ div [ class "shadow overflow-hidden border-b border-gray-200 sm:rounded-lg" ]
                        [ table [ class "min-w-full divide-y divide-gray-200" ]
                            [ thead [ class "bg-gray-50" ]
                                [ tr []
                                    [ th [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" ]
                                        [ text "Nom" ]
                                    , th [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" ]
                                        [ text "Diplôme" ]
                                    , th [ scope "col", class "relative px-6 py-3" ]
                                        [ span [ class "sr-only" ]
                                            [ text "" ]
                                        ]
                                    ]
                                ]
                            , tbody [ class "bg-white divide-y divide-gray-200" ]
                                (List.map viewCandidate candidates)
                            ]
                        ]
                    ]
                ]
            ]
        ]


viewCandidate : Candidate -> Html msg
viewCandidate candidate =
    tr []
        [ td [ class "px-6 py-4 whitespace-nowrap" ]
            [ div [ class "text-sm font-medium text-gray-900" ]
                [ text (candidate.firstname ++ " " ++ candidate.lastname) ]
            , div [ class "text-sm text-gray-500" ]
                [ text candidate.email ]
            ]
        , td [ class "px-6 py-4 whitespace-nowrap" ]
            [ div [ class "text-sm text-gray-900" ]
                [ text (candidate.diplome |> Maybe.map (\diplome -> diplome.label) |> Maybe.withDefault "") ]
            , div [ class "text-sm text-gray-500" ]
                [ text (candidate.cohorte |> Maybe.map (\cohorte -> cohorte.label ++ ", " ++ cohorte.region) |> Maybe.withDefault "") ]
            ]
        , td [ class "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" ]
            [ a [ href "#", class "text-indigo-600 hover:text-indigo-900" ]
                [ text "Edit" ]
            ]
        ]



-- DECODER


diplomeDecoder : Decoder Diplome
diplomeDecoder =
    Decode.succeed Diplome
        |> required "id" Decode.string
        |> required "label" Decode.string


cohorteDecoder : Decoder Cohorte
cohorteDecoder =
    Decode.succeed Cohorte
        |> required "id" Decode.string
        |> required "label" Decode.string
        |> required "region" Decode.string


candidateDecoder : Decoder Candidate
candidateDecoder =
    Decode.succeed Candidate
        |> required "email" Decode.string
        |> required "firstname" Decode.string
        |> required "lastname" Decode.string
        |> optional "diplome" (Decode.maybe diplomeDecoder) Nothing
        |> optional "cohorte" (Decode.maybe cohorteDecoder) Nothing


candidatesDecoder : Decoder (List Candidate)
candidatesDecoder =
    Decode.list candidateDecoder
