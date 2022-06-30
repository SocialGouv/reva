module Page.Form exposing
    ( Data
    , Element(..)
    , Model
    , Msg
    , init
    , update
    , view
    )

import Admin.Object exposing (Candidacy)
import Api exposing (Token)
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacySummary)
import Data.Referential exposing (Referential)
import Html.Styled as Html exposing (Html, a, article, aside, button, div, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, for, href, id, name, placeholder, type_)
import Html.Styled.Events exposing (onClick, onInput)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import View.Helpers exposing (dataTest)


type Msg
    = NoOp


type alias Data =
    { id : String
    , label : String
    , value : Maybe String
    }


type alias SelectData =
    { id : String
    , data : List { id : String, label : String }
    , selected : Maybe String
    }


type Element
    = Checkbox Data
    | Date Data
    | Empty
    | Input Data
    | Number Data
    | Textarea Data
    | Select SelectData
    | Submit String


type alias State =
    {}


type alias Model =
    { endpoint : String
    , token : Token
    , filter : Maybe String
    , selected : RemoteData String Candidacy
    , state : State
    }


init : String -> Token -> ( Model, Cmd Msg )
init endpoint token =
    let
        model =
            { endpoint = endpoint
            , token = token
            , filter = Nothing
            , selected = NotAsked
            , state = {}
            }
    in
    ( model
    , Cmd.none
    )



-- VIEW


view : Html msg
view =
    div []
        [ h2
            [ class "text-2xl font-medium text-gray-900 leading-none" ]
            [ text "Rendez-vous"
            ]
        ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )
