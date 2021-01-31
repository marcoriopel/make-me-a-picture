import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ARROW_KEYS } from '@app/ressources/global-variables/arrow-keys';
import { MARGIN, MouseButton, MOVE_DOWN } from '@app/ressources/global-variables/global-variables';
import { AUTHORIZED_KEY } from '@app/ressources/global-variables/text';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    name: string = TOOL_NAMES.TEXT_TOOL_NAME;
    text: string[];
    indexIndicator: number = 0;
    textStartingPoint: Vec2 = { x: 0, y: 0 };
    isNewText: boolean = false;
    font: string = 'Georgia';
    textSize: number = 30;
    italicText: string = 'normal';
    boldText: string = 'normal';
    align: CanvasTextAlign = 'start';
    height: number;
    isFrontDelete: boolean = false;
    maxLine: string;
    isWritingEnable: boolean = true;

    constructor(drawingService: DrawingService, public hotkeyService: HotkeyService, public colorSelectionService: ColorSelectionService) {
        super(drawingService);
    }

    initializeNewText(): void {
        this.hotkeyService.isHotkeyEnabled = false;
        this.text = [];
        this.isNewText = true;
        this.text.push('|');
        this.applyTextStyle();
    }
    destroy(): void {
        this.text = [];
        this.isNewText = false;
        this.indexIndicator = 0;
        this.hotkeyService.isHotkeyEnabled = true;
    }
    onMouseDown(event: MouseEvent): void {
        if (this.isMouseOnText(this.getPositionFromMouse(event)) || event.button === MouseButton.RIGHT) {
            return;
        }
        if (!this.isNewText) {
            const mousePosition = this.getPositionFromMouse(event);
            this.textStartingPoint = { x: mousePosition.x, y: mousePosition.y };
            this.initializeNewText();
        } else {
            this.createText();
        }
    }

    isMouseOnText(mousePosition: Vec2): boolean {
        if (this.text === undefined) return false;
        const selectionWidth = this.textStartingPoint.x + this.drawingService.previewCtx.measureText(this.maxLine).width;
        const selectionHeight = this.height * this.text.join('').split('Enter').length + this.textStartingPoint.y;
        if (
            mousePosition.x >= this.textStartingPoint.x &&
            mousePosition.x <= selectionWidth &&
            mousePosition.y >= this.textStartingPoint.y &&
            mousePosition.y <= selectionHeight
        ) {
            return true;
        } else {
            return false;
        }
    }

    createText(): void {
        this.removeIndicator();
        this.printText();
        this.drawingService.applyPreview();
        this.destroy();
    }

    onMouseEnter(): void {
        this.applyTextStyle();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.isNewText || !this.isWritingEnable) return;
        switch (event.key) {
            case 'Backspace':
                this.isFrontDelete = false;
                this.deleteText(this.indexIndicator - 1);
                this.indexIndicator--;
                break;
            case 'Delete':
                this.isFrontDelete = true;
                this.deleteText(this.indexIndicator + 1);
                break;
            case ARROW_KEYS.LEFT:
                this.moveIndicator(MOVE_DOWN);
                break;
            case ARROW_KEYS.RIGHT:
                this.moveIndicator(1);
                break;
            case ARROW_KEYS.UP:
                this.moveIndicatorUpAndDown('UP');
                break;
            case ARROW_KEYS.DOWN:
                this.moveIndicatorUpAndDown('DOWN');
                break;
            case 'Escape':
                this.createText();
                break;
            case 'Alt':
                event.preventDefault();
                break;
            default:
                if (this.isCorrectKey(event.key)) {
                    this.insertItemInText(event.key);
                    this.indexIndicator++;
                }
                break;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.printText();
    }

    getIndicatorLineAndIndex(lines: string[]): Vec2 {
        let i = 0;
        for (const line of lines) {
            const indicatorIndex = line.indexOf('|');
            if (indicatorIndex >= 0) {
                return { x: indicatorIndex, y: i };
            }
            i++;
        }
        return { x: -1, y: -1 };
    }

    moveIndicatorUpAndDown(mouvement: string): void {
        const lines = this.text.join('').split('Enter');
        const indicatorPosition: Vec2 = this.getIndicatorLineAndIndex(lines);

        if (mouvement === 'UP' && !this.isInFirstLine()) {
            if (lines[indicatorPosition.y - 1].length < indicatorPosition.x) {
                this.indexIndicator -= indicatorPosition.x + 1;
            } else {
                this.indexIndicator -= indicatorPosition.x + 1;
                this.indexIndicator -= lines[indicatorPosition.y - 1].length - indicatorPosition.x;
            }
        } else if (mouvement === 'DOWN' && !this.isInLastLine()) {
            if (lines[indicatorPosition.y + 1].length < indicatorPosition.x) {
                this.indexIndicator += lines[indicatorPosition.y].length - indicatorPosition.x;
                this.indexIndicator += lines[indicatorPosition.y + 1].length;
            } else {
                this.indexIndicator += lines[indicatorPosition.y].length - indicatorPosition.x;
                this.indexIndicator += indicatorPosition.x;
            }
        }
        this.removeIndicator();
        this.insertItemInText('|');
    }

    isInFirstLine(): boolean {
        const indexEnter = this.text.indexOf('Enter');
        if (indexEnter > this.indexIndicator || indexEnter < 0) {
            return true;
        } else {
            return false;
        }
    }

    isInLastLine(): boolean {
        const indexEnter = this.text.lastIndexOf('Enter');
        if (indexEnter < this.indexIndicator || indexEnter < 0) {
            return true;
        } else {
            return false;
        }
    }

    insertItemInText(item: string): void {
        if (item === '|' && this.indexIndicator >= this.text.length) {
            this.text.push('|');
        } else if (this.indexIndicator >= this.text.length) {
            this.text.pop();
            this.text.push(item);
            this.text.push('|');
        } else {
            const newText = [];
            let i = 0;
            for (const char of this.text) {
                if (i === this.indexIndicator) {
                    newText.push(item);
                }
                newText.push(char);
                i++;
            }
            this.text = newText;
        }
    }

    deleteText(index: number): void {
        if (index < 0 && this.isFrontDelete) return;
        if (index >= this.text.length && !this.isFrontDelete) {
            return;
        }
        const beforeItem = this.text.slice(0, index);
        const afterItem = this.text.slice(index + 1);
        this.text = beforeItem.concat(afterItem);
    }

    removeIndicator(): void {
        const newText = [];
        for (const char of this.text) {
            if (char !== '|') {
                newText.push(char);
            }
        }
        this.text = newText;
    }

    printText(): void {
        this.maxLine = '';
        if (this.text === undefined) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        let line: string[] = [];
        let lineHeight = this.textStartingPoint.y + this.height;
        let lineWidth = this.textStartingPoint.x;
        for (const char of this.text) {
            if (char === 'Enter') {
                if (line.indexOf('|') >= 0) {
                    this.printIndicatorLine(line, lineHeight);
                } else {
                    this.drawingService.previewCtx.fillText(line.join(''), lineWidth, lineHeight);
                }
                lineHeight += this.height + MARGIN;
                if (line.length > this.maxLine.length) this.maxLine = line.join('');
                line = [];
                lineWidth = this.textStartingPoint.x;
            } else {
                line.push(char);
            }
        }
        if (line.indexOf('|') >= 0) {
            this.printIndicatorLine(line, lineHeight);
        } else {
            this.drawingService.previewCtx.fillText(line.join(''), lineWidth, lineHeight);
        }
        if (line.length > this.maxLine.length) this.maxLine = line.join('');
    }

    setStratingPointX(line: string[]): number {
        let lineWidth = this.textStartingPoint.x;
        if (this.align === 'center') {
            lineWidth -= this.drawingService.previewCtx.measureText(line.join('')).width / 2;
        } else if (this.align === 'end') {
            lineWidth -= this.drawingService.previewCtx.measureText(line.join('')).width;
        }
        return lineWidth;
    }

    printIndicatorLine(line: string[], lineHeight: number): void {
        const afterIndicator: string[] = line.slice(line.indexOf('|') + 1);
        const beforeIndicator = line.slice(0, line.indexOf('|'));
        let lineWidth = this.setStratingPointX(line);
        this.drawingService.previewCtx.textAlign = 'start';
        this.drawingService.previewCtx.fillText(beforeIndicator.join(''), lineWidth, lineHeight);
        lineWidth += this.drawingService.previewCtx.measureText(beforeIndicator.join('')).width;
        this.printIndicator(lineWidth, lineHeight);
        lineWidth += this.drawingService.previewCtx.measureText('|').width;
        this.drawingService.previewCtx.fillText(afterIndicator.join(''), lineWidth, lineHeight);
        this.drawingService.previewCtx.textAlign = this.align;
    }

    printIndicator(lineWidth: number, lineHeight: number): void {
        const fillStyle = this.drawingService.previewCtx.fillStyle;
        this.drawingService.previewCtx.fillStyle = '#000000';
        this.drawingService.previewCtx.fillText('|', lineWidth, lineHeight);
        this.drawingService.previewCtx.fillStyle = fillStyle;
    }

    moveIndicator(interval: number): void {
        if (interval < 0 && this.indexIndicator <= 0) return;
        else if (interval > 0 && this.indexIndicator + 1 >= this.text.length) return;
        this.removeIndicator();
        this.indexIndicator = this.indexIndicator + interval;
        this.insertItemInText('|');
    }

    applyTextStyle(): void {
        const textTest = 'wWmML';
        this.drawingService.previewCtx.fillStyle = this.colorSelectionService.primaryColor;
        this.drawingService.previewCtx.font = this.italicText + ' ' + this.boldText + ' ' + this.textSize.toString() + 'px ' + this.font;
        this.drawingService.previewCtx.textAlign = this.align;
        const metrics = this.drawingService.previewCtx.measureText(textTest);
        this.height = metrics.actualBoundingBoxAscent;
        this.printText();
    }

    isCorrectKey(key: string): boolean {
        const isLetter = key >= 'a' && key <= 'z';
        const isNumber = key >= '0' && key <= '9';
        if (isLetter || isNumber || AUTHORIZED_KEY.includes(key)) return true;
        else return false;
    }
}
