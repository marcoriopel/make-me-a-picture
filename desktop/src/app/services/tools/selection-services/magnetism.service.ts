import { Injectable } from '@angular/core';
import { SelectionBox } from '@app/classes/selection-box';
import { Vec2 } from '@app/classes/vec2';
import { AlignmentNames, ALIGNMENT_NAMES } from '@app/ressources/global-variables/alignment-names';
import { GridInfo } from '@app/ressources/global-variables/grid-info';
import { MoveService } from '@app/services/tools/transformation-services/move.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService {
    alignmentNames: AlignmentNames = ALIGNMENT_NAMES;

    constructor(public moveService: MoveService) {}

    magnetismCoordinateReference(alignement: string, selection: SelectionBox): Vec2 {
        switch (alignement) {
            case this.alignmentNames.ALIGN_TOP_CENTER_NAME: {
                return { x: selection.startingPoint.x + selection.width / 2, y: selection.startingPoint.y };
            }
            case this.alignmentNames.ALIGN_TOP_RIGHT_NAME: {
                return { x: selection.startingPoint.x + selection.width, y: selection.startingPoint.y };
            }
            case this.alignmentNames.ALIGN_CENTER_LEFT_NAME: {
                return { x: selection.startingPoint.x, y: selection.startingPoint.y + selection.height / 2 };
            }
            case this.alignmentNames.ALIGN_CENTER_RIGHT_NAME: {
                return { x: selection.startingPoint.x + selection.width, y: selection.startingPoint.y + selection.height / 2 };
            }
            case this.alignmentNames.ALIGN_CENTER_NAME: {
                return {
                    x: selection.startingPoint.x + selection.width / 2,
                    y: selection.startingPoint.y + selection.height / 2,
                };
            }
            case this.alignmentNames.ALIGN_BOTTOM_LEFT_NAME: {
                return { x: selection.startingPoint.x, y: selection.startingPoint.y + selection.height };
            }
            case this.alignmentNames.ALIGN_BOTTOM_CENTER_NAME: {
                return { x: selection.startingPoint.x + selection.width / 2, y: selection.startingPoint.y + selection.height };
            }
            case this.alignmentNames.ALIGN_BOTTOM_RIGHT_NAME: {
                return { x: selection.startingPoint.x + selection.width, y: selection.startingPoint.y + selection.height };
            }
            default: {
                return { x: selection.startingPoint.x, y: selection.startingPoint.y };
            }
        }
    }

    magnetismXAxisChange(mousePosDifferenceX: number, gridInfo: GridInfo, selection: SelectionBox): number {
        const startingCoordRefX = this.magnetismCoordinateReference(gridInfo.ALIGNMENT, selection).x;
        const coordToSnapX = startingCoordRefX + mousePosDifferenceX;
        const lowestXDistance = coordToSnapX % gridInfo.SQUARE_SIZE;
        if (lowestXDistance > gridInfo.SQUARE_SIZE / 2) {
            mousePosDifferenceX = mousePosDifferenceX + gridInfo.SQUARE_SIZE;
        }
        const changeX = mousePosDifferenceX - lowestXDistance;
        return changeX;
    }

    magnetismYAxisChange(mousePosDifferenceY: number, gridInfo: GridInfo, selection: SelectionBox): number {
        const startingCoordRefY = this.magnetismCoordinateReference(gridInfo.ALIGNMENT, selection).y;
        const coordToSnapY = startingCoordRefY + mousePosDifferenceY;
        const lowestYDistance = coordToSnapY % gridInfo.SQUARE_SIZE;
        if (lowestYDistance > gridInfo.SQUARE_SIZE / 2) {
            mousePosDifferenceY = mousePosDifferenceY + gridInfo.SQUARE_SIZE;
        }
        const changeY = mousePosDifferenceY - lowestYDistance;
        return changeY;
    }

    onMouseMoveMagnetism(changeX: number, changeY: number): void {
        this.moveService.onMouseMove(changeX, changeY);
    }
}
