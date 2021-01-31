import { Component } from '@angular/core';
import { INITIAL_STAMP_ANGLE, StampAttributes, Stamps, STAMPS } from '@app/classes/stamps';
import { StampService } from '@app/services/tools/stamp.service';

@Component({
    selector: 'app-stamp-attributes',
    templateUrl: './stamp-attributes.component.html',
    styleUrls: ['./stamp-attributes.component.scss'],
})
export class StampAttributesComponent {
    angle: number = INITIAL_STAMP_ANGLE;
    stamps: Stamps = STAMPS;
    toolSize: number;

    constructor(public stampService: StampService) {
        this.stampService.currentStamp = STAMPS.ANGULAR;
        this.toolSize = this.stampService.stampSize;

        this.stampService.getAngle().subscribe((angle) => {
            this.angle = angle as number;
        });
    }

    changeSize(newSize: number): void {
        this.toolSize = newSize;
        this.stampService.stampSize = newSize;
    }

    changeStamp(newStamp: StampAttributes): void {
        this.stampService.currentStamp = newStamp;
    }

    changeAngle(newAngle: number): void {
        this.angle = newAngle;
        this.stampService.angle = newAngle;
    }
}
