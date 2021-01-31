import { Component } from '@angular/core';
import { PenService } from '@app/services/tools/pen.service';

@Component({
    selector: 'app-pen-attributes',
    templateUrl: './pen-attributes.component.html',
    styleUrls: ['./pen-attributes.component.scss'],
})
export class PenAttributesComponent {
    toolWidth: number;
    angle: number;

    constructor(public penService: PenService) {
        this.toolWidth = penService.width;
        this.angle = penService.angle;

        this.penService.getAngle().subscribe((angle) => {
            this.angle = angle as number;
        });
    }

    changeWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.penService.changeWidth(this.toolWidth);
    }

    changeAngle(newAngle: number): void {
        this.angle = newAngle;
        this.penService.changeAngle(this.angle);
    }
}
