module View.Jury exposing (viewDate, viewResult)

import Accessibility exposing (br, dd, div, dl, dt, h2, p, text)
import Admin.Enum.JuryResult exposing (JuryResult(..))
import Data.Jury exposing (Jury)
import Html exposing (Html)
import Html.Attributes exposing (class)
import View
import View.Date


viewDate : Maybe Jury -> Html msg
viewDate maybeJury =
    case maybeJury of
        Just jury ->
            viewDateHelper jury

        Nothing ->
            View.noticeInfo
                [ class "mb-8" ]
                [ text "Date de jury en attente de saisie par le certificateur" ]


viewResult : Maybe Jury -> Html msg
viewResult maybeJury =
    let
        waitingForResult =
            View.noticeInfo
                [ class "mb-8" ]
                [ text "Résultat du jury en attente" ]
    in
    case maybeJury of
        Just jury ->
            case jury.result of
                Just result ->
                    viewResultHelper jury result

                Nothing ->
                    waitingForResult

        Nothing ->
            waitingForResult


viewDateHelper : Jury -> Html msg
viewDateHelper jury =
    let
        viewOptional label maybeValue =
            div []
                [ dt [ class "uppercase text-xs font-semibold" ] [ text label ]
                , dd
                    []
                    [ case maybeValue of
                        Just value ->
                            text value

                        Nothing ->
                            text "Non renseigné"
                    ]
                ]
    in
    div []
        [ p [ class "mb-10" ]
            [ text "Une date de jury a été attribuée au candidat."
            , br []
            , text "Le candidat doit respecter les précisions apportées dans sa convocation."
            ]
        , dl
            [ class "flex gap-x-28 gap-y-8 flex-wrap mb-8" ]
            [ viewOptional "Date" (Just (View.Date.toFullFormat jury.dateOfSession))
            , viewOptional "Heure de convocation" jury.timeOfSession
            , viewOptional "Lieu" jury.addressOfSession
            , viewOptional "Information complémentaire liée à la session" jury.informationOfSession
            ]
        ]


viewResultHelper : Jury -> JuryResult -> Html msg
viewResultHelper jury result =
    let
        viewOptional f maybeValue =
            case maybeValue of
                Just value ->
                    f value

                Nothing ->
                    text "Non renseigné"
    in
    div []
        [ h2
            [ class "mb-10 text-xl" ]
            [ text "Résultat à l'issue de l'entretien avec le jury" ]
        , div
            [ class "font-bold" ]
            [ viewOptional text (Just (View.Date.toFullFormat jury.dateOfSession))
            , text " - "
            , viewOptional viewResultProvisional jury.isResultProvisional
            , text " :"
            ]
        , div [ class "my-2" ] [ text <| viewResultCategory result ]
        , div [ class "mb-8" ] [ text "“", viewOptional text jury.informationOfResult, text "“" ]
        ]


viewResultProvisional : Bool -> Html msg
viewResultProvisional isResultProvisional =
    if isResultProvisional then
        text "Résultat provisoire"

    else
        text "Résultat définitif"


viewResultCategory : JuryResult -> String
viewResultCategory result =
    case result of
        FullSuccessOfFullCertification ->
            "Réussite totale à une certification visée en totalité"

        PartialSuccessOfFullCertification ->
            "Réussite partielle à une certification visée en totalité"

        FullSuccessOfPartialCertification ->
            "Réussite totale aux blocs de compétences visés"

        PartialSuccessOfPartialCertification ->
            "Réussite partielle aux blocs de compétences visés"

        Failure ->
            "Non validation"

        CandidateExcused ->
            "Candidat excusé sur justificatif"

        CandidateAbsent ->
            "Candidat non présent"
