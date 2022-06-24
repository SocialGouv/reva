module Page.Meetings exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Admin.Object exposing (Candidacy)
import Api exposing (Token)
import Data.Candidacy exposing (Candidacy)
import Html.Styled as Html exposing (Html, div, h1, text)
import Html.Styled.Attributes exposing (class)
import RemoteData exposing (RemoteData(..))
import String exposing (String)


type Msg
    = NoOp


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
        [ h1
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
