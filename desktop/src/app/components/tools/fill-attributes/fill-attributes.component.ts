import { Component } from '@angular/core';
import { FillService } from '@app/services/tools/fill.service';

@Component({
    selector: 'app-fill-attributes',
    templateUrl: './fill-attributes.component.html',
    styleUrls: ['./fill-attributes.component.scss'],
})
export class FillAttributesComponent {
    tolerance: number;

    constructor(public fillService: FillService) {
        this.tolerance = fillService.tolerance;
    }

    changeTolerance(newTolerance: number): void {
        this.tolerance = newTolerance;
        this.fillService.changeTolerance(this.tolerance);
    }
}
