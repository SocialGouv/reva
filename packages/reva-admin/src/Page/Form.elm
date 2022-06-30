module Page.Form exposing
    ( Element(..)
    , Form
    , Model
    , Msg
    , init
    , update
    , updateForm
    , view
    )

import Admin.Object exposing (Candidacy)
import Api exposing (Token)
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacySummary)
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import Html.Styled as Html exposing (Html, a, article, aside, button, div, h2, h3, input, label, li, nav, node, option, p, select, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, for, href, id, name, placeholder, type_)
import Html.Styled.Events exposing (onClick, onInput)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import View.Helpers exposing (dataTest)


type Msg
    = NoOp


type Element
    = Checkbox String
    | Date String
    | Empty
    | Input String
    | Number String
    | Textarea String
    | Select String (List ( String, String ))
    | SelectOther String String


type alias Form =
    List ( String, Element )


type alias FormData =
    Dict String String


type RemoteForm
    = NotAsked
    | Loading Form
    | Loaded Form FormData
    | Failure


type alias Model =
    { endpoint : String
    , token : Token
    , filter : Maybe String
    , form : RemoteForm
    }


init : String -> Token -> ( Model, Cmd Msg )
init endpoint token =
    let
        model =
            { endpoint = endpoint
            , token = token
            , filter = Nothing
            , form = NotAsked
            }
    in
    ( model
    , Cmd.none
    )



-- VIEW


view : Model -> Html Msg
view model =
    let
        content =
            case model.form of
                NotAsked ->
                    text ""

                Loading form ->
                    viewForm Dict.empty form

                Loaded form formData ->
                    viewForm formData form

                Failure ->
                    text "Une erreur est survenue"
    in
    div [ class "p-12 h-screen" ]
        [ h2
            [ class "text-2xl font-medium text-gray-900 leading-none" ]
            [ text "Rendez-vous"
            ]
        , content
        ]


viewForm : FormData -> Form -> Html Msg
viewForm formData form =
    div
        [ class "mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6" ]
    <|
        List.map (viewElement formData) form


viewElement : FormData -> ( String, Element ) -> Html Msg
viewElement formData ( elementId, element ) =
    let
        data =
            Dict.get elementId formData

        inputView =
            input
                [ type_ "text"
                , name elementId
                , id elementId
                , class "flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                , class "mt-1 block w-full min-w-0 rounded sm:text-sm border-gray-300"
                ]
                []

        withLabel s el =
            div
                [ class "sm:col-span-4" ]
                [ label
                    [ for elementId
                    , class "block text-sm font-medium text-gray-700"
                    ]
                    [ text s ]
                , el
                ]
    in
    case element of
        Checkbox label ->
            inputView
                |> withLabel label

        Date label ->
            inputView
                |> withLabel label

        Empty ->
            text ""

        Input label ->
            inputView
                |> withLabel label

        Number label ->
            inputView
                |> withLabel label

        Textarea label ->
            inputView
                |> withLabel label

        Select label choices ->
            select
                [ id elementId
                , class "mt-1 block w-full pl-3 pr-10 py-2"
                , class "text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                ]
                (List.map viewChoice choices)
                |> withLabel label

        SelectOther _ _ ->
            text ""


viewChoice : ( String, String ) -> Html msg
viewChoice ( choiceId, choice ) =
    option [ id choiceId ] [ text choice ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )


updateForm : Form -> Model -> ( Model, Cmd msg )
updateForm form model =
    ( { model | form = Loading form }, Cmd.none )
