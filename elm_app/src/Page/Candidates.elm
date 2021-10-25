module Page.Candidates exposing (Candidate, Model, addFilter, candidatesDecoder, init, receiveCandidates, view)

import Html.Styled exposing (Html, a, div, img, span, table, tbody, td, text, th, thead, tr)
import Html.Styled.Attributes exposing (alt, class, href, scope, src)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Page.Login exposing (Model)


type alias Model =
    { filter : Maybe String, state : State }


type State
    = Loading
    | Idle (List Candidate)


type alias Candidate =
    { lastCreatedAt : String
    , email : String
    , firstname : String
    , lastname : String
    , diplome : Maybe Diplome
    , city : Maybe City
    , passes : String
    }


type alias City =
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
    { filter = Nothing, state = Loading }


receiveCandidates : Model -> List Candidate -> Model
receiveCandidates model candidates =
    { model | state = Idle candidates }


addFilter : Model -> String -> Model
addFilter model filter =
    { model | filter = Just filter }


filterCandidate : String -> Candidate -> Bool
filterCandidate filter candidate =
    let
        match s =
            String.toLower s
                |> String.contains (String.toLower filter)
    in
    match candidate.email
        || match candidate.firstname
        || match candidate.lastname
        || (Maybe.map (.label >> match) candidate.diplome |> Maybe.withDefault False)
        || (Maybe.map (\city -> match city.label || match city.region) candidate.city
                |> Maybe.withDefault False
           )



-- VIEW


view : Model -> Html msg
view model =
    case model.state of
        Loading ->
            div [] [ text "loading" ]

        Idle candidates ->
            case model.filter of
                Nothing ->
                    viewCandidates candidates

                Just filter ->
                    let
                        filteredCandidate =
                            List.filter (filterCandidate filter) candidates
                    in
                    viewCandidates filteredCandidate


viewCandidates : List Candidate -> Html msg
viewCandidates candidates =
    div [ class "-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 text-sm" ]
        [ div [ class "py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8" ]
            [ div [ class "shadow overflow-hidden border-b border-gray-200 sm:rounded-lg min-w-screen-lg max-w-screen-xl" ]
                [ table [ class "min-w-full divide-y divide-gray-200" ]
                    [ thead [ class "bg-gray-50" ]
                        [ tr []
                            [ th [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" ]
                                [ text "Nom" ]
                            , th [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" ]
                                [ text "Diplôme" ]
                            , th [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right" ]
                                [ text "Passages" ]
                            , th [ scope "col", class "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right" ]
                                [ text "Dernier passage" ]
                            ]
                        ]
                    , tbody [ class "bg-white divide-y divide-gray-200" ]
                        (List.map viewCandidate candidates)
                    ]
                ]
            ]
        ]


viewCandidate : Candidate -> Html msg
viewCandidate candidate =
    tr []
        [ td [ class "px-6 py-4 max-w-sm" ]
            [ div [ class "font-medium truncate" ]
                [ text candidate.lastname
                , text " "
                , span [ class "text-gray-500" ] [ text candidate.firstname ]
                ]
            , a
                [ class "text-blue-500 hover:text-blue-600 truncate"
                , href ("mailto:" ++ candidate.email)
                ]
                [ text candidate.email ]
            ]
        , td [ class "px-6 py-4 max-w-xl" ]
            [ div [ class "truncate" ]
                [ text (candidate.diplome |> Maybe.map (\diplome -> diplome.label) |> Maybe.withDefault "") ]
            , div [ class "text-gray-500 truncate" ]
                [ text (candidate.city |> Maybe.map (\city -> city.label ++ ", " ++ city.region) |> Maybe.withDefault "") ]
            ]
        , td [ class "px-6 py-4" ]
            [ div [ class "text-gray-500 text-right" ]
                [ text candidate.passes ]
            ]
        , td [ class "px-6 py-4" ]
            [ div [ class "text-gray-500 text-right" ]
                [ text candidate.lastCreatedAt ]
            ]
        ]



-- DECODER


diplomeDecoder : Decoder Diplome
diplomeDecoder =
    Decode.succeed Diplome
        |> required "id" Decode.string
        |> required "label" Decode.string


cityDecoder : Decoder City
cityDecoder =
    Decode.succeed City
        |> required "id" Decode.string
        |> required "label" Decode.string
        |> required "region" Decode.string


candidateDecoder : Decoder Candidate
candidateDecoder =
    Decode.succeed Candidate
        |> required "lastCreatedAt" Decode.string
        |> required "email" Decode.string
        |> required "firstname" Decode.string
        |> required "lastname" Decode.string
        |> optional "diplome" (Decode.maybe diplomeDecoder) Nothing
        |> optional "city" (Decode.maybe cityDecoder) Nothing
        |> required "passes" Decode.string


candidatesDecoder : Decoder (List Candidate)
candidatesDecoder =
    Decode.list candidateDecoder
