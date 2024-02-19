-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.CandidacyStatusFilter exposing (..)

import Json.Decode as Decode exposing (Decoder)


type CandidacyStatusFilter
    = ActiveHorsAbandon
    | Abandon
    | Reorientee
    | ArchiveHorsAbandonHorsReorientation
    | ParcoursConfirmeHorsAbandon
    | PriseEnChargeHorsAbandon
    | ParcoursEnvoyeHorsAbandon
    | DossierFaisabiliteEnvoyeHorsAbandon
    | DossierFaisabiliteRecevableHorsAbandon
    | DossierFaisabiliteIncompletHorsAbandon
    | DossierFaisabiliteNonRecevableHorsAbandon
    | DossierDeValidationEnvoyeHorsAbandon
    | DossierDeValidationSignaleHorsAbandon
    | JuryHorsAbandon
    | JuryProgrammeHorsAbandon
    | JuryPasseHorsAbandon
    | DemandeFinancementEnvoyeHorsAbandon
    | DemandePaiementEnvoyeeHorsAbandon
    | ValidationHorsAbandon
    | ProjetHorsAbandon


list : List CandidacyStatusFilter
list =
    [ ActiveHorsAbandon, Abandon, Reorientee, ArchiveHorsAbandonHorsReorientation, ParcoursConfirmeHorsAbandon, PriseEnChargeHorsAbandon, ParcoursEnvoyeHorsAbandon, DossierFaisabiliteEnvoyeHorsAbandon, DossierFaisabiliteRecevableHorsAbandon, DossierFaisabiliteIncompletHorsAbandon, DossierFaisabiliteNonRecevableHorsAbandon, DossierDeValidationEnvoyeHorsAbandon, DossierDeValidationSignaleHorsAbandon, JuryHorsAbandon, JuryProgrammeHorsAbandon, JuryPasseHorsAbandon, DemandeFinancementEnvoyeHorsAbandon, DemandePaiementEnvoyeeHorsAbandon, ValidationHorsAbandon, ProjetHorsAbandon ]


decoder : Decoder CandidacyStatusFilter
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "ACTIVE_HORS_ABANDON" ->
                        Decode.succeed ActiveHorsAbandon

                    "ABANDON" ->
                        Decode.succeed Abandon

                    "REORIENTEE" ->
                        Decode.succeed Reorientee

                    "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION" ->
                        Decode.succeed ArchiveHorsAbandonHorsReorientation

                    "PARCOURS_CONFIRME_HORS_ABANDON" ->
                        Decode.succeed ParcoursConfirmeHorsAbandon

                    "PRISE_EN_CHARGE_HORS_ABANDON" ->
                        Decode.succeed PriseEnChargeHorsAbandon

                    "PARCOURS_ENVOYE_HORS_ABANDON" ->
                        Decode.succeed ParcoursEnvoyeHorsAbandon

                    "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON" ->
                        Decode.succeed DossierFaisabiliteEnvoyeHorsAbandon

                    "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON" ->
                        Decode.succeed DossierFaisabiliteRecevableHorsAbandon

                    "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON" ->
                        Decode.succeed DossierFaisabiliteIncompletHorsAbandon

                    "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON" ->
                        Decode.succeed DossierFaisabiliteNonRecevableHorsAbandon

                    "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON" ->
                        Decode.succeed DossierDeValidationEnvoyeHorsAbandon

                    "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON" ->
                        Decode.succeed DossierDeValidationSignaleHorsAbandon

                    "JURY_HORS_ABANDON" ->
                        Decode.succeed JuryHorsAbandon

                    "JURY_PROGRAMME_HORS_ABANDON" ->
                        Decode.succeed JuryProgrammeHorsAbandon

                    "JURY_PASSE_HORS_ABANDON" ->
                        Decode.succeed JuryPasseHorsAbandon

                    "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON" ->
                        Decode.succeed DemandeFinancementEnvoyeHorsAbandon

                    "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON" ->
                        Decode.succeed DemandePaiementEnvoyeeHorsAbandon

                    "VALIDATION_HORS_ABANDON" ->
                        Decode.succeed ValidationHorsAbandon

                    "PROJET_HORS_ABANDON" ->
                        Decode.succeed ProjetHorsAbandon

                    _ ->
                        Decode.fail ("Invalid CandidacyStatusFilter type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : CandidacyStatusFilter -> String
toString enum____ =
    case enum____ of
        ActiveHorsAbandon ->
            "ACTIVE_HORS_ABANDON"

        Abandon ->
            "ABANDON"

        Reorientee ->
            "REORIENTEE"

        ArchiveHorsAbandonHorsReorientation ->
            "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"

        ParcoursConfirmeHorsAbandon ->
            "PARCOURS_CONFIRME_HORS_ABANDON"

        PriseEnChargeHorsAbandon ->
            "PRISE_EN_CHARGE_HORS_ABANDON"

        ParcoursEnvoyeHorsAbandon ->
            "PARCOURS_ENVOYE_HORS_ABANDON"

        DossierFaisabiliteEnvoyeHorsAbandon ->
            "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON"

        DossierFaisabiliteRecevableHorsAbandon ->
            "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON"

        DossierFaisabiliteIncompletHorsAbandon ->
            "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON"

        DossierFaisabiliteNonRecevableHorsAbandon ->
            "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON"

        DossierDeValidationEnvoyeHorsAbandon ->
            "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON"

        DossierDeValidationSignaleHorsAbandon ->
            "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON"

        JuryHorsAbandon ->
            "JURY_HORS_ABANDON"

        JuryProgrammeHorsAbandon ->
            "JURY_PROGRAMME_HORS_ABANDON"

        JuryPasseHorsAbandon ->
            "JURY_PASSE_HORS_ABANDON"

        DemandeFinancementEnvoyeHorsAbandon ->
            "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON"

        DemandePaiementEnvoyeeHorsAbandon ->
            "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON"

        ValidationHorsAbandon ->
            "VALIDATION_HORS_ABANDON"

        ProjetHorsAbandon ->
            "PROJET_HORS_ABANDON"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe CandidacyStatusFilter
fromString enumString____ =
    case enumString____ of
        "ACTIVE_HORS_ABANDON" ->
            Just ActiveHorsAbandon

        "ABANDON" ->
            Just Abandon

        "REORIENTEE" ->
            Just Reorientee

        "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION" ->
            Just ArchiveHorsAbandonHorsReorientation

        "PARCOURS_CONFIRME_HORS_ABANDON" ->
            Just ParcoursConfirmeHorsAbandon

        "PRISE_EN_CHARGE_HORS_ABANDON" ->
            Just PriseEnChargeHorsAbandon

        "PARCOURS_ENVOYE_HORS_ABANDON" ->
            Just ParcoursEnvoyeHorsAbandon

        "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON" ->
            Just DossierFaisabiliteEnvoyeHorsAbandon

        "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON" ->
            Just DossierFaisabiliteRecevableHorsAbandon

        "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON" ->
            Just DossierFaisabiliteIncompletHorsAbandon

        "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON" ->
            Just DossierFaisabiliteNonRecevableHorsAbandon

        "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON" ->
            Just DossierDeValidationEnvoyeHorsAbandon

        "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON" ->
            Just DossierDeValidationSignaleHorsAbandon

        "JURY_HORS_ABANDON" ->
            Just JuryHorsAbandon

        "JURY_PROGRAMME_HORS_ABANDON" ->
            Just JuryProgrammeHorsAbandon

        "JURY_PASSE_HORS_ABANDON" ->
            Just JuryPasseHorsAbandon

        "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON" ->
            Just DemandeFinancementEnvoyeHorsAbandon

        "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON" ->
            Just DemandePaiementEnvoyeeHorsAbandon

        "VALIDATION_HORS_ABANDON" ->
            Just ValidationHorsAbandon

        "PROJET_HORS_ABANDON" ->
            Just ProjetHorsAbandon

        _ ->
            Nothing
