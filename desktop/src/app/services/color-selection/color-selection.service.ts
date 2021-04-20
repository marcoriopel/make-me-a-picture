import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ColorSelectionService {
    primaryColor: string;

    setColor(color: string): void {
        this.primaryColor = color;
    }
}
