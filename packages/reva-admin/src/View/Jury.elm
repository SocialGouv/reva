module View.Jury exposing (viewDate)

import Accessibility exposing (br, dd, div, dl, dt, p, text)
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
            View.noticeInfo [ class "mb-8" ] [ text "Date de jury en attente de saisie par le certificateur" ]


viewDateHelper : Jury -> Html msg
viewDateHelper jury =
    let
        viewOptional label maybeValue =
            div
                []
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
