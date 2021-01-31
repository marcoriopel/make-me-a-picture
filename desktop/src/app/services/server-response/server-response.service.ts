import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CONFIRM_SAVED_DURATION } from '@app/ressources/global-variables/global-variables';

@Injectable({
    providedIn: 'root',
})
export class ServerResponseService {
    constructor(public snackBar: MatSnackBar) {}

    loadErrorSnackBar(): void {
        const config = new MatSnackBarConfig();
        this.snackBar.open('Erreur dans le chargement du dessin', 'Fermer', config);
    }

    saveErrorSnackBar(error: string): void {
        const config = new MatSnackBarConfig();
        this.snackBar.open('Erreur dans la sauvegarde: ' + error, 'Fermer', config);
    }

    deleteErrorSnackBar(error: string): void {
        const config = new MatSnackBarConfig();
        this.snackBar.open('Erreur dans la suppression du dessin: ' + error, 'Fermer', config);
    }

    saveConfirmSnackBar(): void {
        const config = new MatSnackBarConfig();
        config.duration = CONFIRM_SAVED_DURATION;
        this.snackBar.open('Le dessin a été sauvegardé', 'Fermer', config);
    }

    sendMailConfirmSnackBar(): void {
        const config = new MatSnackBarConfig();
        config.duration = CONFIRM_SAVED_DURATION;
        this.snackBar.open('Le courriel est bien envoyé', 'Fermer', config);
    }

    sendMailErrorSnackBar(error: string): void {
        const config = new MatSnackBarConfig();
        this.snackBar.open('Erreur dans le transfert du courrie: ' + error, 'Fermer', config);
    }
}
