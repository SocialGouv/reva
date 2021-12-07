module View.Candidate.Recognition exposing (Step(..), view)

import Candidate exposing (Candidate)
import Html.Styled exposing (Attribute, Html, button, div, h3, h4, label, p, text, textarea)
import Html.Styled.Attributes exposing (attribute, class, for, id, name, placeholder, rows, type_)
import Html.Styled.Events exposing (onClick)
import List.Extra
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Step
    = Introduction
    | Selection
    | Contextualization MetaSkillReference
    | Confirmation


type alias MetaSkillReference =
    { id : String
    , category : String
    , name : String
    , selected : Bool
    }


predefinedMetaSkills : List MetaSkillReference
predefinedMetaSkills =
    [ { id = "1"
      , category = "Travail en équipe"
      , name = "J'ai progressé et je sais travailler en équipe (gestion du temps, collaboration, contribution aux objectifs du groupe)"
      }
    , { id = "2"
      , category = "Travail en équipe"
      , name = "J'ai progressé et je sais respecter les règles de vivre ensemble (ponctualité, assiduité, écoute, respect, bienveillance)"
      }
    , { id = "3"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais adopter une posture professionnelle (ponctualité, respect des délais, savoir communiquer, rigueur )"
      }
    , { id = "4"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais organiser mon travail en fonction des priorités et des échéances fixées"
      }
    , { id = "5"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais prendre des initiatives dans le cadre professionnel"
      }
    , { id = "6"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais faire faire preuve d'autonomie (organiser mon activité et prendre des initiatives)"
      }
    , { id = "7"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais faciliter l'apprentissage des autres (je sais motiver les autres, les aider)"
      }
    , { id = "8"
      , category = "Posture professionnelle"
      , name = "J'ai progressé et je sais analyser avec recul ma pratique professionnelle, me remettre en question"
      }
    , { id = "9"
      , category = "Compétences informatiques"
      , name = "J'ai progressé et je sais utiliser les fonctions de base d'un ordinateur (traitement de texte,\nmessagerie électronique, recherche d'informations sur Internet)"
      }
    , { id = "10"
      , category = "Communication orale"
      , name = "J'ai progressé et je sais exposer une idée à l'oral de facon compréhensible"
      }
    , { id = "11"
      , category = "Communication orale"
      , name = "J'ai progressé et je sais écouter, prendre en compte ce que dit l'autre"
      }
    , { id = "12"
      , category = "Communication écrite"
      , name = "J'ai progressé et je sais exposer une idée à l'écrit de facon compréhensible, en respectant les règles d'orthographe, de grammaire"
      }
    ]
        |> List.map
            (\skill ->
                { id = skill.id
                , category = skill.category
                , name = skill.name
                , selected = False
                }
            )


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
    [ title3 "Reconnaissance de méta-compétences"
    , p []
        [ text "Bientôt, vous pourrez démarrer ici une démarche de reconnaissance. Accompagné du candidat, vous sélectionnerez une ou plusieurs méta-compétences à reconnaître."
        ]
    , p
        [ class "mt-2" ]
        [ text "Pour chaque méta-compétence, vous ajouterez du contexte et chargerez les éventuels fichiers de preuves. A l'issue de ce processus, vous pourrez générer un livret de reconnaissance."
        ]
    , p
        [ class "mt-2" ]
        [ text "D'ici la mise à disposition du module de reconnaissance, vous pouvez nous poser vos questions via le chat en bas à droite de cette page ou tester notre démo." ]
    , actionFooter
        { dataTest = "start-recognition"
        , text = "Démarrer la démonstration"
        , toMsg = config.onRecognitionStep Selection
        }
    ]


selection : { a | onRecognitionStep : Step -> msg } -> Candidate -> List (Html msg)
selection config _ =
    let
        viewSkillButton : MetaSkillReference -> Html msg
        viewSkillButton skill =
            viewSkill
                [ dataTest <| "skill-" ++ skill.id
                , type_ "button"
                , onClick <| config.onRecognitionStep (Contextualization skill)
                ]
                skill

        viewSkills ( firstSkill, nextSkills ) =
            div
                [ class "flex flex-col items-center mb-4" ]
                [ title4 [ text firstSkill.category ]
                , List.map viewSkillButton (firstSkill :: nextSkills)
                    |> div
                        [ class "grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3"
                        , class "bg-gray-100 p-8 rounded-lg mb-4"
                        ]
                ]
    in
    popup
        { title = "Sélectionnez une compétence"
        , onClose = config.onRecognitionStep Introduction
        , content =
            [ groupByCategory predefinedMetaSkills
                |> List.map viewSkills
                |> div []
            ]
        }


viewSkill : List (Attribute msg) -> MetaSkillReference -> Html msg
viewSkill attributes skill =
    let
        el =
            if skill.selected then
                div

            else
                button
    in
    el
        ([ class "flex"
         , class "relative block h-48 text-left text-base"
         , class "text-gray-700 p-5 rounded-lg"
         , class <|
            if skill.selected then
                "bg-gray-100"

            else
                "group bg-white transition-shadow shadow hover:shadow-lg hover:text-gray-800"
         ]
            ++ attributes
        )
        [ div [ class "ml-1" ] [ text skill.name ]
        , div [ class "absolute bottom-4 right-4" ]
            [ if skill.selected then
                Icons.checked

              else
                Icons.add
            ]
        ]


contextualization : { a | onRecognitionStep : Step -> msg } -> Candidate -> MetaSkillReference -> List (Html msg)
contextualization config _ skill =
    let
        commentPlaceholder =
            "Décrivez au moins une situation pendant laquelle la compétence s'est illustrée"
    in
    popup
        { title = "Décrivez les mises en situation"
        , onClose = config.onRecognitionStep Introduction
        , content =
            [ div
                [ class "flex flex-col w-1/2 items-center"
                , class "rounded-lg px-6 py-5 bg-blue-50 my-8"
                ]
                [ div
                    [ class "text-left w-full" ]
                    [ title4 [ text skill.category ]
                    , p
                        [ class "mt-2"
                        , class "text-base text-gray-800"
                        ]
                        [ text skill.name ]
                    ]
                , div
                    [ class "text-left w-full mt-3" ]
                    [ label
                        [ for "comment", class "sr-only" ]
                        [ text commentPlaceholder ]
                    , div
                        [ class "my-2" ]
                        [ textarea
                            [ rows 4
                            , name "context"
                            , id "context"
                            , placeholder commentPlaceholder
                            , class "shadow-base block w-full border-gray-300 rounded-md"
                            , class "focus:ring-indigo-500 focus:border-indigo-500"
                            ]
                            []
                        ]
                    ]
                ]
            , actionFooter
                { dataTest = "confirm-recognition"
                , text = "Reconnaître"
                , toMsg = config.onRecognitionStep Confirmation
                }
            ]
        }


confirmation : { a | onRecognitionStep : Step -> msg } -> Candidate -> List (Html msg)
confirmation config _ =
    popup
        { title = "Compétence reconnue"
        , onClose = config.onRecognitionStep Introduction
        , content =
            [ alert "Mode de démonstration, aucune action n'a été enregistrée."
            , div [ class "h-40" ] []
            , actionFooter
                { dataTest = "close-recognition"
                , text = "Terminer"
                , toMsg = config.onRecognitionStep Introduction
                }
            , button
                [ dataTest "restart-recognition"
                , onClick <| config.onRecognitionStep Selection
                , type_ "button"
                , class "text-base hover:text-blue-700 text-blue-600 mt-4 px-8 py-5 w-full"
                ]
                [ text "Reconnaître une autre compétence" ]
            ]
        }



-- HELPERS


popup : { a | title : String, onClose : msg, content : List (Html msg) } -> List (Html msg)
popup config =
    [ div
        [ dataTest "popup"
        , class "fixed z-50 inset-0 overflow-y-auto"
        , attribute "aria-labelledby" "selection"
        , attribute "role" "dialog"
        , attribute "aria-modal" "true"
        ]
        [ div
            [ class "flex items-end justify-center h-screen w-screen py-12 px-48" ]
            [ div
                [ dataTest "close-popup"
                , class "fixed inset-0 bg-gray-400"
                , onClick config.onClose
                ]
                []
            , div
                [ class "relative bg-white max-w-5xl rounded-lg overflow-hidden shadow-xl transform transition-all"
                , class "flex flex-col items-center text-center"
                , class "sm:align-middle sm:w-full sm:h-full"
                ]
                [ div
                    [ class "absolute top-0 w-full bg-white pt-4"
                    , class "border-b"
                    ]
                    [ title3 config.title
                    , button
                        [ dataTest "close-popup"
                        , type_ "button"
                        , onClick config.onClose
                        , class "absolute top-0 right-0"
                        , class "hover:text-blue-900"
                        , class "flex items-center h-full px-6"
                        ]
                        [ text "Fermer" ]
                    ]
                , div [ class "flex flex-col w-full items-center mt-16 pt-6 px-8 overflow-y-scroll" ] config.content
                ]
            ]
        ]
    ]


alert : String -> Html msg
alert s =
    div
        [ class "w-full rounded-lg px-8 py-4 font-semibold bg-yellow-100 text-yellow-800" ]
        [ text s ]


groupByCategory : List MetaSkillReference -> List ( MetaSkillReference, List MetaSkillReference )
groupByCategory =
    List.Extra.groupWhile
        (\s1 s2 -> s1.category == s2.category)


title3 : String -> Html msg
title3 s =
    h3
        [ class "mb-4 text-2xl font-semibold text-gray-800" ]
        [ text s ]


title4 : List (Html msg) -> Html msg
title4 content =
    h4
        [ class "font-semibold text-gray-700 text-lg mb-2 mr-2" ]
        content


actionFooter : { a | dataTest : String, text : String, toMsg : msg } -> Html msg
actionFooter config =
    div
        [ class "text-base flex items-center justify-start mt-4" ]
        [ button
            [ dataTest config.dataTest
            , onClick config.toMsg
            , type_ "button"
            , class "rounded bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            ]
            [ text config.text ]
        ]
