module View.Candidacy.NavigationSteps exposing (archiveView, dropOutView, reorientationView, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Admin.Enum.OrganismTypology exposing (OrganismTypology(..))
import Admin.Object.Candidacy exposing (organism)
import BetaGouv.DSFR.Button as Button
import Data.Candidacy as Candidacy exposing (Candidacy)
import Html exposing (Html, div, h2, h3, span, text)
import Html.Attributes exposing (attribute, class)
import Route
import Time
import View.Candidacy.Tab
import View.Date
import View.Steps


type ButtonState
    = Enabled
    | Disabled


view : Bool -> String -> Candidacy -> Html msg
view feasabilityFeatureEnabled baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Meetings)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Training)

        admissibilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Admissibility)

            else
                Nothing

        examInfoLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.ExamInfo)

            else
                Nothing

        feasabilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Feasability)

            else
                Nothing

        showAdmissibilityMenuEntry =
            case candidacy.organism of
                Just organism ->
                    organism.typology == Experimentation

                Nothing ->
                    False

        admissibilityMenuEntry =
            if showAdmissibilityMenuEntry then
                [ { content = expandedView Enabled "Gestion de la recevabilité" ParcoursConfirme candidacy
                  , navigation = admissibilityLink
                  }
                ]

            else
                []

        showFeasabilityMenuEntry =
            case candidacy.organism of
                Just organism ->
                    organism.typology /= Experimentation && feasabilityFeatureEnabled

                Nothing ->
                    False

        feasabilityMenuEntry =
            if showFeasabilityMenuEntry then
                [ { content = expandedView Enabled "Dossier de faisabilité" ParcoursConfirme candidacy
                  , navigation = feasabilityLink
                  }
                ]

            else
                []
    in
    View.Steps.view (title "Toutes les étapes")
        (Candidacy.statusToProgressPosition (candidacyStatus candidacy))
        (List.concat
            [ [ { content = expandedView Enabled "Rendez-vous pédagogique" PriseEnCharge candidacy
                , navigation = appointmentLink
                }
              , { content = expandedView Enabled "Définition du parcours" PriseEnCharge candidacy
                , navigation = trainingLink
                }
              , { content = [ View.Steps.info "Validation du parcours" ]
                , navigation = Nothing
                }
              ]
            , admissibilityMenuEntry
            , feasabilityMenuEntry
            , [ { content = expandedView Enabled "Jury" ParcoursConfirme candidacy
                , navigation = examInfoLink
                }
              , { content = expandedView Disabled "Demande de prise en charge" ParcoursConfirme candidacy
                , navigation = Nothing
                }
              , { content = expandedView Enabled "Demande de paiement" DemandeFinancementEnvoye candidacy
                , navigation = paymentRequestLink baseUrl candidacy
                }
              ]
            ]
        )


dropOutView : String -> Candidacy -> Time.Posix -> Html msg
dropOutView baseUrl candidacy dropOutDate =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        dropOutInfo =
            [ h3 [ class "text-sm mt-1" ] [ text "Abandon du candidat confirmé" ]
            , span [ class "text-sm text-gray-700 mb-2" ] [ text <| View.Date.toFullFormat dropOutDate ]
            ]

        dropOutLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.DropOut)

        progressPosition =
            if Candidacy.isPaymentRequestSent candidacy then
                4

            else if Candidacy.isFundingRequestSent candidacy then
                3

            else
                2
    in
    View.Steps.view (title "Abandon du candidat")
        progressPosition
        [ { content = dropOutInfo
          , navigation = dropOutLink
          }
        , { content = expandedView Disabled "Demande de prise en charge" ParcoursConfirme candidacy
          , navigation = Nothing
          }
        , { content = expandedView Enabled "Demande de paiement" DemandeFinancementEnvoye candidacy
          , navigation = paymentRequestLink baseUrl candidacy
          }
        ]


archiveView : String -> Candidacy -> Html msg
archiveView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatus candidacy.statuses |> .createdAt

        archiveLink =
            Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.Archive)
    in
    View.Steps.view (title "Candidature supprimée")
        2
        [ { content = [ text "Supprimée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
          }
        ]


reorientationView : String -> Candidacy -> Html msg
reorientationView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatus candidacy.statuses |> .createdAt

        archiveLink =
            Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.Archive)
    in
    View.Steps.view (title "Candidature réorientée")
        2
        [ { content = [ text "Réorientée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
          }
        ]


title : String -> Html msg
title value =
    h2
        [ class "my-4 flex items-end"
        , class "text-xl font-semibold"
        ]
        [ text value ]


expandedView : ButtonState -> String -> Candidacy.Step -> Candidacy -> List (Html msg)
expandedView buttonState stepTitle status candidacy =
    [ View.Steps.link stepTitle
    , if candidacyStatus candidacy == status then
        div
            []
            [ Button.new { onClick = Nothing, label = "Compléter" }
                |> Button.withAttrs [ attribute "aria-label" ("Compléter " ++ stepTitle) ]
                |> (if buttonState == Disabled then
                        Button.disable

                    else
                        identity
                   )
                |> Button.view
            ]

      else
        text ""
    ]


candidateInfoLink : String -> Candidacy -> Maybe (Html.Attribute msg)
candidateInfoLink baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        fundingView =
            if Candidacy.isStatusEqualOrAbove candidacy DemandeFinancementEnvoye then
                tab View.Candidacy.Tab.FundingRequest

            else
                tab View.Candidacy.Tab.CandidateInfo
    in
    if candidacy.dropOutDate /= Nothing || Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
        Just <| Route.href baseUrl <| Route.Candidacy fundingView

    else
        Nothing


paymentRequestLink : String -> Candidacy -> Maybe (Html.Attribute msg)
paymentRequestLink baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.PaymentRequest
    in
    if Candidacy.isStatusEqualOrAbove candidacy DemandeFinancementEnvoye then
        Just <| Route.href baseUrl <| Route.Candidacy tab

    else
        Nothing


candidacyStatus : Candidacy -> Candidacy.Step
candidacyStatus candidacy =
    (Candidacy.lastStatus >> .status) candidacy.statuses
