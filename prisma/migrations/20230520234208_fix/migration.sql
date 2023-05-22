/*
  Warnings:

  - Added the required column `utilisateurId` to the `Commentaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `commentaire` ADD COLUMN `utilisateurId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Commentaire` ADD CONSTRAINT `Commentaire_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
