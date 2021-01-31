import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MAX_NAME_LENGTH, MAX_NUMBER_TAG, MAX_TAG_LENGTH } from '@app/ressources/global-variables/global-variables';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';
import { TextService } from '@app/services/tools/text.service';
import { MetaData } from '@common/communication/drawing-data';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-saving',
    templateUrl: './saving.component.html',
    styleUrls: ['./saving.component.scss'],
})
export class SavingComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();
    isSaveButtonDisabled: boolean = false;
    currentTag: string = '';
    name: string = '';
    maxTags: boolean = false;
    isLastTagInvalid: boolean = false;
    addOnBlur: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    tags: string[] = [];
    ownerForm: FormGroup;
    constructor(
        public hotkeyService: HotkeyService,
        public serverResponseService: ServerResponseService,
        public databaseService: DatabaseService,
        public drawingService: DrawingService,
        public dialog: MatDialog,
        public textService: TextService,
    ) {}
    @ViewChild('chipList') chipList: MatChipList;
    @ViewChild('tag') tagInput: ElementRef;

    ngOnInit(): void {
        if (this.textService.isNewText) {
            this.textService.createText();
        }
        this.hotkeyService.isHotkeyEnabled = false;
        this.ownerForm = new FormGroup({
            name: new FormControl(this.name, [Validators.required, Validators.maxLength(MAX_NAME_LENGTH)]),
            tags: new FormControl(this.currentTag, [Validators.maxLength(MAX_NAME_LENGTH)]),
        });
    }

    currentTagInput(tag: string): void {
        this.currentTag = tag;
        if (tag.length > MAX_TAG_LENGTH) {
            this.chipList.errorState = true;
            this.chipList._markAsTouched();
        } else {
            this.chipList.errorState = false;
        }
    }
    hasError(controlName: string, errorName: string): boolean {
        return this.ownerForm.controls[controlName].hasError(errorName);
    }

    hasTagError(tag: string): boolean {
        return tag.length > MAX_TAG_LENGTH;
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.validateTag(value);
        }
        if (this.tags.length === MAX_NUMBER_TAG) {
            this.maxTags = true;
            this.tagInput.nativeElement.disabled = true;
        }
        if (input) {
            input.value = '';
        }
    }

    validateTag(tag: string): void {
        if (this.tags.length < MAX_NUMBER_TAG) {
            if (tag.length > MAX_TAG_LENGTH) {
                this.isLastTagInvalid = true;
            } else {
                this.tags.push(tag.trim());
                this.isLastTagInvalid = false;
            }
        }
    }
    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (this.maxTags) {
            this.maxTags = false;
            this.tagInput.nativeElement.disabled = false;
        }
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    async addDrawing(): Promise<void> {
        this.isSaveButtonDisabled = true;
        const canvas = this.drawingService.baseCtx.canvas.toDataURL();
        const blob = await (await fetch(canvas)).blob();
        const ID: string = new Date().getUTCMilliseconds() + '';
        const meta: MetaData = { id: ID, name: this.name, tags: this.tags };
        this.databaseService
            .addDrawing(meta, blob)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    this.isSaveButtonDisabled = false;
                    this.serverResponseService.saveConfirmSnackBar();
                    this.dialog.closeAll();
                },
                (error) => {
                    this.isSaveButtonDisabled = false;
                    this.serverResponseService.saveErrorSnackBar(error.error);
                    this.dialog.closeAll();
                },
            );
    }

    changeName(name: string): void {
        this.name = name;
        this.ownerForm.markAllAsTouched();
    }

    ngOnDestroy(): void {
        this.hotkeyService.isHotkeyEnabled = true;
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
