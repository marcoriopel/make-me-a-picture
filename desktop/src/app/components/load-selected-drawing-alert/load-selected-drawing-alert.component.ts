import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-load-selected-drawing-alert',
    templateUrl: './load-selected-drawing-alert.component.html',
    styleUrls: ['./load-selected-drawing-alert.component.scss'],
})
export class LoadSelectedDrawingAlertComponent {
    constructor(public dialogRef: MatDialogRef<LoadSelectedDrawingAlertComponent>) {}

    close(): void {
        this.dialogRef.close('Fermer');
    }

    load(): void {
        this.dialogRef.close('Oui');
    }
}
