-- Une demande de mise a jour totale initiee par un administrateur n'est pas une demande
-- de precisions sur un dossier depose: elle a son propre courriel et son propre libelle.
ALTER TYPE "MaisonMereAAPLegalInformationDocumentsDecisionEnum" ADD VALUE 'DEMANDE_DE_MISE_A_JOUR_TOTALE';
