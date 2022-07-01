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
import Html.Styled as Html exposing (Html, a, article, aside, button, div, h2, h3, input, label, li, nav, node, option, p, select, span, text, textarea, ul)
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
    div []
        [ div
            [ class "mt-6 space-y-6" ]
          <|
            List.map (viewElement formData) form
        , div
            [ class "mt-8 border-t pb-4 flex justify-end" ]
            [ button
                [ dataTest "save-description"
                , type_ "submit"
                , class "text-center mt-4 rounded bg-blue-600"
                , class "hover:bg-blue-700 text-white px-4 py-2"
                ]
                [ text "Enregistrer" ]
            ]
        ]


viewElement : FormData -> ( String, Element ) -> Html Msg
viewElement formData ( elementId, element ) =
    let
        data =
            Dict.get elementId formData

        inputView dataType extraClass =
            input
                [ type_ dataType
                , name elementId
                , id elementId
                , class extraClass
                , class "flex-1 focus:ring-blue-500 focus:border-blue-500"
                , class "mt-1 block min-w-0 rounded sm:text-sm border-gray-300"
                ]
                []

        textareaView =
            textarea
                [ name elementId
                , id elementId
                , class "shadow-sm focus:ring-blue-500 focus:border-blue-500"
                , class "block w-full sm:text-sm border-gray-300 rounded-md"
                ]
                []

        labelView s =
            label
                [ for elementId
                , class "block text-sm font-medium text-gray-700"
                ]
                [ text s ]

        withLabel s el =
            div
                []
                [ labelView s
                , el
                ]
    in
    case element of
        Checkbox label ->
            div
                [ class "flex items-center h-5 w-full" ]
                [ inputView
                    "checkbox"
                    "focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                , labelView label
                ]

        Date label ->
            inputView "date" "w-36"
                |> withLabel label

        Empty ->
            text ""

        Input label ->
            inputView "text" "w-full"
                |> withLabel label

        Number label ->
            inputView "number" "w-16"
                |> withLabel label

        Textarea label ->
            textareaView
                |> withLabel label

        Select label choices ->
            select
                [ id elementId
                , class "mt-1 block w-64 pl-3 pr-10 py-2"
                , class "text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
