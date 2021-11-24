module View.Candidate.Recognition exposing (Step(..), view)

import Candidate exposing (Candidate)
import Html.Styled exposing (Html, button, div, h3, h4, input, label, p, text, textarea)
import Html.Styled.Attributes exposing (class, for, id, name, placeholder, rows, type_)
import Html.Styled.Events exposing (onClick)


type Step
    = Introduction
    | Selection
    | Contextualization MetaSkillReference
    | Confirmation


type alias MetaSkillReference =
    { id : String
    , name : String
    }


predefinedMetaSkills : List MetaSkillReference
predefinedMetaSkills =
    [ { id = "1"
      , name = "Identifier des compétences"
      }
    , { id = "2"
      , name = "Rédiger en français"
      }
    , { id = "3"
      , name = "Se présenter à l'oral"
      }
    , { id = "4"
      , name = "Analyser son expérience"
      }
    , { id = "5"
      , name = "Comprendre un référentiel"
      }
    ]


view : { a | onRecognitionStep : Step -> msg } -> Step -> Candidate -> List (Html msg)
view config step candidate =
    case step of
        Introduction ->
            introduction config candidate

        Selection ->
            selection config candidate

        Contextualization skill ->
            contextualization config candidate skill

        Confirmation ->
            confirmation config candidate


introduction : { a | onRecognitionStep : Step -> msg } -> Candidate -> List (Html msg)
introduction config _ =
    [ title "Reconnaissance de méta-compétences"
    , p []
        [ text "Bientôt, vous pourrez démarrer ici une démarche de reconnaissance. Accompagné du candidat, vous sélectionnerez une ou plusieurs méta-compétences à reconnaître."
        ]
    , p
        [ class "mt-2" ]
        [ text "Pour chaque méta-compétence, vous ajouterez du contexte et chargerez les éventuels fichiers de preuves. A l'issue de ce processus, vous pourrez générer un livret de reconnaissance."
        ]
    , p
        [ class "mt-2" ]
        [ text "D'ici la mise à disposition du module de reconnaissance, vous pouvez nous poser vos questions via le chat en bas à droite de cette page." ]
    , actionFooter "Continuer" <| config.onRecognitionStep Selection
    ]


selection : { a | onRecognitionStep : Step -> msg } -> Candidate -> List (Html msg)
selection config _ =
    let
        viewSkill : MetaSkillReference -> Html msg
        viewSkill skill =
            button
                [ type_ "button"
                , class skillClass
                , class "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
                , onClick <| config.onRecognitionStep (Contextualization skill)
                ]
                [ text skill.name ]
    in
    [ title "Sélectionnez une compétence à reconnaître"
    , div [] <| List.map viewSkill predefinedMetaSkills
    ]


contextualization : { a | onRecognitionStep : Step -> msg } -> Candidate -> MetaSkillReference -> List (Html msg)
contextualization config _ skill =
    [ title "Optionnel : ajoutez du contexte à cette reconnaissance"
    , h4
        [ class skillClass
        , class "bg-gray-100"
        ]
        [ text skill.name ]
    , div
        [ class "border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        ]
        [ label
            [ for "description"
            , class "sr-only"
            ]
            [ text "Contexte et détails sur la démarche de reconnaissance du candidat" ]
        , textarea
            [ rows 3
            , name "description"
            , id "description"
            , class "block w-full border-0 py-3 px-4 resize-none placeholder-gray-500 focus:ring-0 sm:text-sm"
            , placeholder "Contexte et détails sur la démarche de reconnaissance du candidat"
            ]
            []
        ]
    , actionFooter "Reconnaître" <| config.onRecognitionStep Confirmation
    ]


confirmation : { a | onRecognitionStep : Step -> msg } -> Candidate -> List (Html msg)
confirmation config _ =
    [ title "Confirmation" ]



-- HELPERS


title : String -> Html msg
title s =
    h3
        [ class "mb-4 text-lg font-semibold text-gray-800" ]
        [ text s ]


skillClass =
    "w-full text-left rounded-lg p-4 mb-4 shadow-sm border border-gray-300"


actionFooter : String -> msg -> Html msg
actionFooter label toMsg =
    div
        [ class "flex items-center justify-start mt-4" ]
        [ button
            [ onClick toMsg
            , type_ "button"
            , class "rounded bg-blue-500 text-white px-8 py-2"
            ]
            [ text label ]
        ]
