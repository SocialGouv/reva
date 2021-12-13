module Page.Candidates.Recognition exposing (Model, Msg, Step(..), init, update, view)

import Actions
import Browser.Dom
import Candidate exposing (Candidate)
import Candidate.MetaSkill exposing (MetaSkill)
import Html.Styled exposing (Html, button, div, form, h3, h4, label, p, text, textarea)
import Html.Styled.Attributes exposing (attribute, class, for, id, minlength, name, placeholder, required, rows, type_)
import Html.Styled.Events exposing (onClick, onInput, onSubmit)
import List.Extra
import Task
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = UserUpdatedSkillComment MetaSkill String
    | UserUpdatedNewSkill MetaSkill String
    | UserNavigateTo Step
    | NoOp


type Step
    = Introduction
    | Selection
    | CreateMetaSkill MetaSkill
    | Contextualization MetaSkill
    | Confirmation MetaSkill
    | Review


type alias Model =
    { step : Step }


type alias MetaSkillReference =
    { id : String
    , category : String
    , name : String
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
                }
            )


view : Model -> Candidate -> Html Msg
view model candidate =
    div [] <|
        case model.step of
            Introduction ->
                introduction candidate

            Selection ->
                selection candidate

            CreateMetaSkill skill ->
                createMetaSkill skill

            Contextualization skill ->
                contextualization skill

            Confirmation skill ->
                review candidate (Just skill)

            Review ->
                review candidate Nothing


introduction : Candidate -> List (Html Msg)
introduction _ =
    [ title3 "Reconnaissance de méta-compétences"
    , p []
        [ text "Bientôt, vous pourrez démarrer ici une démarche de reconnaissance. Accompagné du candidat, vous sélectionnerez une ou plusieurs méta-compétences à reconnaître."
        ]
    , p
        [ class "mt-2" ]
        [ text "Pour chaque méta-compétence, vous ajouterez du contexte et chargerez les éventuels fichiers de preuves. A l'issue de ce processus, vous pourrez générer un livret de reconnaissance."
        ]
    , p
        [ class "mt-2 mb-4" ]
        [ text "D'ici la mise à disposition du module de reconnaissance, vous pouvez nous poser vos questions via le chat en bas à droite de cette page ou tester notre démo." ]
    , actionFooter
        { dataTest = "start-recognition"
        , text = "Démarrer la démonstration"
        , toMsg = UserNavigateTo Selection
        }
    , secondaryActionFooter
        { dataTest = "review-recognition"
        , text = "Voir les compétences reconnues"
        , toMsg = UserNavigateTo Review
        }
    ]


selection : Candidate -> List (Html Msg)
selection _ =
    let
        viewSkillButton skill =
            button
                [ dataTest <| "skill-" ++ skill.id
                , type_ "button"
                , onClick <|
                    UserNavigateTo <|
                        Contextualization
                            { id = skill.id
                            , category = skill.category
                            , name = skill.name
                            , comment = ""
                            }
                , class "flex"
                , class "relative block h-40 text-left text-base leading-snug"
                , class "text-gray-800 p-5 rounded-lg"
                , class "group border border-gray-300 bg-white transition-shadow shadow-sm"
                , class "hover:border-gray-400"
                ]
                [ div [ class "ml-1" ] [ text skill.name ]
                , div [ class "absolute bottom-4 right-4" ] [ Icons.add ]
                ]

        viewSkills ( firstSkill, nextSkills ) =
            div
                [ class "my-12" ]
                [ title4 [ text firstSkill.category ]
                , List.map viewSkillButton (firstSkill :: nextSkills)
                    |> viewSkillGrid
                ]
    in
    popup
        { title = "Sélectionnez une compétence"
        , onClose = UserNavigateTo Introduction
        , content =
            [ div [ class "my-6" ]
                [ button
                    [ dataTest "create-skill"
                    , class "mt-4 w-full rounded bg-blue-600"
                    , class "hover:bg-blue-700 text-white px-8 py-3"
                    , onClick <|
                        UserNavigateTo <|
                            CreateMetaSkill
                                { id = ""
                                , category = ""
                                , name = ""
                                , comment = ""
                                }
                    ]
                    [ text "Créer une compétence" ]
                ]
            , groupByCategory predefinedMetaSkills
                |> List.map viewSkills
                |> div []
            ]
        }


createMetaSkill : MetaSkill -> List (Html Msg)
createMetaSkill skill =
    let
        namePlaceHolder =
            "Décrivez la compétence que vous souhaitez créer"
    in
    popup
        { title = "Décrivez votre compétence"
        , onClose = UserNavigateTo Introduction
        , content =
            [ div
                [ class "flex justify-center items-center"
                , class "py-24 bg-gray-100 w-full flex-grow"
                ]
                [ form
                    [ class "max-w-md w-full rounded-lg px-6 py-5 bg-white", onSubmit <| UserNavigateTo (Contextualization skill) ]
                    [ label
                        [ for "name", class "sr-only" ]
                        [ text namePlaceHolder ]
                    , textarea
                        [ dataTest "name"
                        , onInput (UserUpdatedNewSkill skill)
                        , required True
                        , minlength 25
                        , rows 4
                        , name "name"
                        , id "name"
                        , placeholder namePlaceHolder
                        , class "block w-full border-gray-300 rounded-md mt-4 mb-1 "
                        , class "focus:ring-indigo-500 focus:border-indigo-500"
                        ]
                        []
                    , button
                        [ dataTest "confirm-recognition"
                        , type_ "submit"
                        , class "mt-4 w-full rounded bg-blue-600"
                        , class "hover:bg-blue-700 text-white px-8 py-3"
                        ]
                        [ text "Valider" ]
                    ]
                ]
            , secondaryActionFooter
                { dataTest = "restart-recognition"
                , text = "← Sélectionner une autre compétence"
                , toMsg = UserNavigateTo Selection
                }
            ]
        }


contextualization : MetaSkill -> List (Html Msg)
contextualization skill =
    let
        commentPlaceholder =
            "Décrivez au moins une situation pendant laquelle la compétence s'est illustrée"
    in
    popup
        { title = "Décrivez une situation"
        , onClose = UserNavigateTo Introduction
        , content =
            [ div
                [ class "flex justify-center items-center"
                , class "py-24 bg-gray-100 w-full flex-grow"
                ]
                [ viewSkill
                    [ form
                        [ onSubmit <| UserNavigateTo (Confirmation skill) ]
                        [ label
                            [ for "situation", class "sr-only" ]
                            [ text commentPlaceholder ]
                        , textarea
                            [ dataTest "situation"
                            , onInput (UserUpdatedSkillComment skill)
                            , required True
                            , minlength 25
                            , rows 4
                            , name "situation"
                            , id "situation"
                            , placeholder commentPlaceholder
                            , class "block w-full border-gray-300 rounded-md mt-4 mb-1 "
                            , class "focus:ring-indigo-500 focus:border-indigo-500"
                            ]
                            []
                        , button
                            [ dataTest "confirm-recognition"
                            , type_ "submit"
                            , class "mt-4 w-full rounded bg-blue-600"
                            , class "hover:bg-blue-700 text-white px-8 py-3"
                            ]
                            [ text "Reconnaître" ]
                        ]
                    ]
                    skill
                ]
            , secondaryActionFooter
                { dataTest = "restart-recognition"
                , text = "← Sélectionner une autre compétence"
                , toMsg = UserNavigateTo Selection
                }
            ]
        }


review : Candidate -> Maybe MetaSkill -> List (Html Msg)
review candidate maybeSkill =
    let
        viewSkillWithComment skill =
            viewSkill
                [ div
                    [ class "text-gray-600"
                    , class "bg-gray-100 w-full rounded-md px-3 py-2 mt-2"
                    ]
                    [ text skill.comment ]
                ]
                skill
    in
    popup
        { title = "Compétences reconnues"
        , onClose = UserNavigateTo Introduction
        , content =
            [ case maybeSkill of
                Just skill ->
                    alert <|
                        "Mode de démonstration, la compétence \""
                            ++ skill.name
                            ++ "\" n'a\u{00A0}pas\u{00A0}été\u{00A0}enregistrée."

                Nothing ->
                    text ""
            , div
                [ class "flex-grow bg-gray-100 w-full overflow-y-scroll" ]
                [ viewSkillGrid <|
                    List.map
                        viewSkillWithComment
                        candidate.metaSkills
                ]
            , actionFooter
                { dataTest = "restart-recognition"
                , text = "Reconnaître une autre compétence"
                , toMsg = UserNavigateTo Selection
                }
            ]
        }


viewSkill : List (Html Msg) -> MetaSkill -> Html Msg
viewSkill situation skill =
    div
        [ dataTest "candidate-skill"
        , class "max-w-md w-full rounded-lg px-6 py-5 bg-white"
        , class "border border-gray-300"
        ]
        [ div
            [ class "text-left w-full" ]
            [ p
                [ class "mt-2"
                , class "text-base text-gray-800 leading-snug"
                ]
                [ text skill.name ]
            ]
        , div [ class "text-left w-full mt-3" ] situation
        ]


viewSkillGrid : List (Html msg) -> Html msg
viewSkillGrid =
    div
        [ class "grid grid-cols-1 gap-4 justify-items-center sm:grid-cols-2 lg:grid-cols-3"
        , class "bg-gray-100 p-10 mb-4"
        ]



-- UPDATE


update : Candidate -> Model -> Msg -> ( Model, Cmd Msg, List Actions.Action )
update candidate model msg =
    case msg of
        UserNavigateTo (CreateMetaSkill skill) ->
            ( { model | step = CreateMetaSkill skill }
            , Browser.Dom.focus "label"
                |> Task.attempt (\_ -> NoOp)
            , []
            )

        UserNavigateTo (Contextualization skill) ->
            ( { model | step = Contextualization skill }
            , Browser.Dom.focus "situation"
                |> Task.attempt (\_ -> NoOp)
            , []
            )

        UserNavigateTo (Confirmation skill) ->
            ( { model | step = Confirmation skill }
            , Cmd.none
            , [ Actions.UpdateCandidate
                    { candidate
                        | metaSkills = skill :: candidate.metaSkills
                    }
              ]
            )

        UserNavigateTo step ->
            ( { model | step = step }
            , Cmd.none
            , []
            )

        UserUpdatedNewSkill skill name ->
            ( { model | step = CreateMetaSkill { skill | name = name } }
            , Cmd.none
            , []
            )

        UserUpdatedSkillComment skill comment ->
            ( { model | step = Contextualization { skill | comment = comment } }
            , Cmd.none
            , []
            )

        NoOp ->
            ( model, Cmd.none, [] )


init : Model
init =
    { step = Introduction }



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
            [ class "flex items-end justify-center h-screen w-screen py-12 px-8" ]
            [ div
                [ dataTest "close-popup"
                , class "fixed inset-0 bg-gray-400"
                , onClick config.onClose
                ]
                []
            , div
                [ class "relative bg-white max-w-6xl rounded-lg overflow-hidden shadow-xl transform transition-all"
                , class "flex flex-col items-center text-center"
                , class "sm:align-middle sm:w-full sm:h-full"
                ]
                [ div
                    [ class "relative w-full bg-white pt-4"
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
                , div
                    [ class "flex flex-col w-full h-full items-center overflow-y-scroll" ]
                    config.content
                ]
            ]
        ]
    ]


alert : String -> Html msg
alert s =
    div
        [ class "my-8"
        , class "rounded-lg px-8 py-4 font-semibold bg-yellow-100 text-yellow-800 mx-6"
        ]
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


footerWrapper : List (Html msg) -> Html msg
footerWrapper =
    div
        [ class "border-t w-full flex items-center justify-center h-28" ]


actionFooter : { a | dataTest : String, text : String, toMsg : msg } -> Html msg
actionFooter config =
    footerWrapper
        [ button
            [ dataTest config.dataTest
            , onClick config.toMsg
            , type_ "button"
            , class "max-w-sm rounded bg-blue-600"
            , class "hover:bg-blue-700 text-white px-8 py-3"
            ]
            [ text config.text ]
        ]


secondaryActionFooter : { a | dataTest : String, text : String, toMsg : msg } -> Html msg
secondaryActionFooter config =
    footerWrapper
        [ button
            [ dataTest config.dataTest
            , onClick config.toMsg
            , type_ "button"
            , class "text-base hover:text-blue-700 text-blue-600 mx-4 px-8"
            ]
            [ text config.text ]
        ]
