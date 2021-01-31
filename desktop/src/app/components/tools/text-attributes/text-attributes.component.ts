import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MAX_TEXT_TOOL_SIZE, MIN_TEXT_TOOL_SIZE } from '@app/ressources/global-variables/global-variables';
import { FONTS, Fonts } from '@app/ressources/global-variables/text';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { TextService } from '@app/services/tools/text.service';

@Component({
    selector: 'app-text-attributes',
    templateUrl: './text-attributes.component.html',
    styleUrls: ['./text-attributes.component.scss'],
})
export class TextComponent implements OnDestroy {
    @ViewChild('textSizeInput', { read: ElementRef }) textSizeInput: ElementRef;
    textSize: number;
    fontStyle: Fonts = {
        GEORGIA: FONTS.GEORGIA,
        ARIAL: FONTS.ARIAL,
        TIME_NEW_ROMAN: FONTS.TIME_NEW_ROMAN,
        VERDANA: FONTS.VERDANA,
        COURIER_NEW: FONTS.COURIER_NEW,
    };
    maxTextSize: number = MAX_TEXT_TOOL_SIZE;
    minTextSize: number = MIN_TEXT_TOOL_SIZE;

    constructor(public textService: TextService, public hotkeyService: HotkeyService) {
        this.textSize = this.textService.textSize;
    }

    changeFont(font: string): void {
        this.textService.font = font;
        this.textService.applyTextStyle();
    }

    changeSize(size: number): void {
        size = Number(size);
        if (isNaN(size) || size < MIN_TEXT_TOOL_SIZE || size > MAX_TEXT_TOOL_SIZE || size.toString() === '') {
            alert('La taille du texte doit être un nombre entre 10 et 100.');
        } else {
            this.textSize = size;
            this.textService.textSize = size;
            this.textService.applyTextStyle();
        }
    }

    changeItalic(style: boolean): void {
        if (style) {
            this.textService.italicText = 'italic';
        } else {
            this.textService.italicText = 'normal';
        }
        this.textService.applyTextStyle();
    }

    changeBoldText(bold: boolean): void {
        if (bold) {
            this.textService.boldText = 'bold';
        } else {
            this.textService.boldText = 'normal';
        }
        this.textService.applyTextStyle();
    }

    changeAlignment(align: string): void {
        this.textService.align = align as CanvasTextAlign;
        this.textService.applyTextStyle();
    }

    ngOnDestroy(): void {
        this.textService.createText();
    }

    onFocus(): void {
        this.hotkeyService.isHotkeyEnabled = false;
        this.textService.isWritingEnable = false;
    }

    onFocusOut(): void {
        this.textService.isWritingEnable = true;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.textSizeInput.nativeElement.blur();
            event.stopPropagation();
        }
    }
}
