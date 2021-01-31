import { Component } from '@angular/core';
import { Feature } from '@app/ressources/texts/feature';
import { BASIC_TOOLS, DRAWING_TOOLS, FILL, OTHER_FEATURES, SHAPES, TRANSFORMATIONS, UNDO_REDO } from '@app/ressources/texts/outils-description';

@Component({
    selector: 'app-drawing-detail',
    templateUrl: './drawing-detail.component.html',
    styleUrls: ['./drawing-detail.component.scss'],
})
export class DrawingDetailComponent {
    basicTools: Feature[] = BASIC_TOOLS;

    otherFeatures: Feature[] = OTHER_FEATURES;

    drawingTools: Feature[] = DRAWING_TOOLS;

    shapes: Feature[] = SHAPES;

    fills: Feature[] = FILL;

    undoredo: Feature[] = UNDO_REDO;

    transformations: Feature[] = TRANSFORMATIONS;
}
