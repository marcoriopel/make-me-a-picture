import { Component } from '@angular/core';
import { SquareService } from '@app/services/tools/square.service';

@Component({
    selector: 'app-square-attributes',
    templateUrl: './square-attributes.component.html',
    styleUrls: ['./square-attributes.component.scss'],
})
export class SquareAttributesComponent {
    toolWidth: number;
    fillStyle: number;

    constructor(public squareService: SquareService) {
        this.toolWidth = squareService.width;
        this.fillStyle = squareService.fillStyle;
    }

    changeBorderWidth(newWidth: number): void {
        this.toolWidth = newWidth;
        this.squareService.changeWidth(newWidth);
    }

    changeFillStyle(newFillStyle: number): void {
        this.squareService.changeFillStyle(newFillStyle);
    }
}
