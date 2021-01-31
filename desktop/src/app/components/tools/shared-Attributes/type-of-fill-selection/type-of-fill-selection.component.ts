import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FillStyles, FILL_STYLES } from '@app/ressources/global-variables/fill-styles';

@Component({
    selector: 'app-type-of-fill-selection',
    templateUrl: './type-of-fill-selection.component.html',
    styleUrls: ['./type-of-fill-selection.component.scss'],
})
export class TypeOfFillSelectionComponent {
    @Input() currentFillStyle: number;
    @Output() valueChange: EventEmitter<number> = new EventEmitter();

    fillStyles: FillStyles = {
        FILL_AND_BORDER: FILL_STYLES.FILL_AND_BORDER,
        FILL: FILL_STYLES.FILL,
        BORDER: FILL_STYLES.BORDER,
        DASHED: FILL_STYLES.DASHED,
    };

    changeValue(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.valueChange.emit(Number(target.value));
    }
}
