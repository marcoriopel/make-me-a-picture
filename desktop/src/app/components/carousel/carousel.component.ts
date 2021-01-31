import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoadSelectedDrawingAlertComponent } from '@app/components/load-selected-drawing-alert/load-selected-drawing-alert.component';
import { MAX_NAME_LENGTH, MAX_NUMBER_TAG, MAX_NUMBER_VISIBLE_DRAWINGS, MAX_TAG_LENGTH } from '@app/ressources/global-variables/global-variables';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';
import { TextService } from '@app/services/tools/text.service';
import { DBData } from '@common/communication/drawing-data';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();
    databaseMetadata: DBData[] = [];
    filteredMetadata: DBData[] = [];
    gotImages: boolean = false;
    isOpenButtonDisabled: boolean = false;
    visibleDrawingsIndexes: number[] = [];
    currentTag: string = '';
    maxTags: boolean = false;
    isArrowEventsChecked: boolean = true;
    name: string = '';
    drawingOfInterest: number = 0;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    tags: string[] = [];
    currentRoute: string;
    IMAGE_BASE_PATH: string = 'http://localhost:3000/api/database/getDrawingPng/';
    constructor(
        public router: Router,
        public hotkeyService: HotkeyService,
        public serverResponseService: ServerResponseService,
        public databaseService: DatabaseService,
        public dialog: MatDialog,
        public drawingService: DrawingService,
        public resizeDrawingService: ResizeDrawingService,
        public textService: TextService,
    ) {}

    @ViewChild('chipList', { static: false }) chipList: MatChipList;

    ngOnInit(): void {
        if (this.textService.isNewText) {
            this.textService.createText();
        }
        this.hotkeyService.isHotkeyEnabled = false;
        this.loadDBData();
        this.currentRoute = this.router.url;
    }

    disableEvents(): void {
        this.isArrowEventsChecked = false;
    }

    enableEvents(): void {
        this.isArrowEventsChecked = true;
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (!this.isArrowEventsChecked) return;
        if (this.databaseMetadata.length <= 1) return;
        if (this.databaseMetadata.length === 2 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            this.onClickTwoDrawings();
            return;
        }
        if (event.key === 'ArrowLeft') {
            this.onPreviousClick();
        } else if (event.key === 'ArrowRight') {
            this.onNextClick();
        }
    }

    loadDBData(): void {
        this.gotImages = false;
        this.databaseMetadata = [];
        this.visibleDrawingsIndexes = [];
        this.databaseService
            .getAllDBData()
            .pipe(takeUntil(this.destroy$))
            .subscribe((dBData: DBData[]) => {
                this.databaseMetadata = dBData;
                this.filteredMetadata = this.databaseMetadata;
                this.manageShownDrawings();
                this.gotImages = true;
            });

        this.showDrawingsWithFilter();
    }

    isArray(object: DBData): boolean {
        return Array.isArray(object.tags);
    }

    manageShownDrawings(): void {
        for (let i = 0; i < this.filteredMetadata.length; i++) {
            if (i >= MAX_NUMBER_VISIBLE_DRAWINGS) {
                break;
            }
            if (i === 1) {
                this.drawingOfInterest = i;
            }
            this.visibleDrawingsIndexes.push(i);
        }
        this.gotImages = true;
    }
    onPreviewClick(positionIndex: number): void {
        if (this.filteredMetadata.length === 2) {
            if (positionIndex === this.drawingOfInterest) this.loadSelectedDrawing(positionIndex);
            else this.onClickTwoDrawings();
        } else {
            if (positionIndex < 1) {
                this.onPreviousClick();
            } else if (positionIndex > 1) {
                this.onNextClick();
            } else {
                this.loadSelectedDrawing(positionIndex);
            }
        }
    }

    loadSelectedDrawing(positionIndex: number): void {
        if (this.currentRoute !== '/home' && !this.drawingService.isCanvasBlank(this.drawingService.baseCtx)) {
            const loadDrawingAlert = this.dialog.open(LoadSelectedDrawingAlertComponent);
            loadDrawingAlert
                .afterClosed()
                .pipe(takeUntil(this.destroy$))
                .subscribe((optionChosen: string) => {
                    if (optionChosen === 'Oui') {
                        this.applySelectedDrawing(this.visibleDrawingsIndexes[positionIndex]);
                        this.dialog.closeAll();
                    }
                });
        } else {
            this.applySelectedDrawing(this.visibleDrawingsIndexes[positionIndex]);
            this.dialog.closeAll();
        }
    }

    async applySelectedDrawing(index: number): Promise<void> {
        if (this.currentRoute === '/home') {
            this.router.navigateByUrl('/editor');
            this.currentRoute = '/editor';
        }
        this.databaseService
            .getDrawingPng(this.filteredMetadata[index].fileName)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (image: Blob) => {
                    const img = URL.createObjectURL(image);
                    this.drawImageOnCanvas(img);
                },
                (error) => {
                    this.serverResponseService.loadErrorSnackBar();
                },
            );
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            if (this.tags.length < MAX_NUMBER_TAG) {
                if (value.length < MAX_TAG_LENGTH) {
                    this.tags.push(value.trim());
                }
            }
            if (this.tags.length === MAX_NUMBER_TAG) {
                this.maxTags = true;
            }
        }
        if (input) {
            input.value = '';
        }
        this.showDrawingsWithFilter();
    }

    removeTag(tags: string): void {
        const index = this.tags.indexOf(tags);
        if (this.maxTags) {
            this.maxTags = false;
        }

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
        this.showDrawingsWithFilter();
    }

    showDrawingsWithFilter(): void {
        this.gotImages = false;
        this.filteredMetadata = [];
        this.visibleDrawingsIndexes = [];
        if (!this.tags.length) {
            this.filteredMetadata = this.databaseMetadata;
        }
        for (const data of this.databaseMetadata) {
            if (!data.tags.length) return;

            if (!Array.isArray(data.tags)) {
                if (this.tags.includes(data.tags)) {
                    this.filteredMetadata.push(data);
                    return;
                }
            }

            for (const tag of data.tags) {
                if (this.tags.includes(tag)) {
                    this.filteredMetadata.push(data);
                    break;
                }
            }
        }
        this.manageShownDrawings();
    }
    async drawImageOnCanvas(image: string): Promise<void> {
        return new Promise<void>((resolve) => {
            const drawing = new Image();
            drawing.src = image;
            drawing.onload = () => {
                this.resizeDrawingService.resizeCanvasSize(drawing.width, drawing.height);
                this.drawingService.baseCtx.drawImage(drawing, 0, 0, drawing.width, drawing.height);
                this.drawingService.resetStack();
                resolve();
            };
        });
    }

    deleteDrawing(): void {
        this.gotImages = false;
        let fileName: string = this.databaseMetadata[this.visibleDrawingsIndexes[0]].fileName;
        if (this.databaseMetadata.length > 1) {
            fileName = this.databaseMetadata[this.visibleDrawingsIndexes[this.drawingOfInterest]].fileName;
        }
        this.databaseService
            .deleteDrawing(fileName)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (data) => {
                    this.loadDBData();
                },
                (error) => {
                    this.serverResponseService.deleteErrorSnackBar(error.error);
                    this.gotImages = true;
                },
            );
    }

    onClickTwoDrawings(): void {
        if (this.drawingOfInterest === 1) {
            this.drawingOfInterest = 0;
        } else {
            this.drawingOfInterest = 1;
        }
    }

    onPreviousClick(): void {
        this.visibleDrawingsIndexes[2] = this.visibleDrawingsIndexes[1];
        this.visibleDrawingsIndexes[1] = this.visibleDrawingsIndexes[0];
        if (!this.visibleDrawingsIndexes[0]) {
            this.visibleDrawingsIndexes[0] = this.filteredMetadata.length - 1;
        } else {
            this.visibleDrawingsIndexes[0]--;
        }
    }

    onNextClick(): void {
        this.visibleDrawingsIndexes[0] = this.visibleDrawingsIndexes[1];
        this.visibleDrawingsIndexes[1] = this.visibleDrawingsIndexes[2];

        if (this.visibleDrawingsIndexes[2] === this.filteredMetadata.length - 1) {
            this.visibleDrawingsIndexes[2] = 0;
        } else {
            this.visibleDrawingsIndexes[2]++;
        }
    }

    hasLengthTagError(tag: string): boolean {
        return tag.length > MAX_NAME_LENGTH;
    }

    hasSpaceTagError(tag: string): boolean {
        if (tag.indexOf(' ') < 0) {
            return false;
        } else {
            return true;
        }
    }

    currentTagInput(tag: string): void {
        this.currentTag = tag;
        if (tag.length > MAX_TAG_LENGTH || tag.indexOf(' ') >= 0) {
            this.chipList.errorState = true;
            this.chipList._markAsTouched();
        } else {
            this.chipList.errorState = false;
        }
    }

    ngOnDestroy(): void {
        this.hotkeyService.isHotkeyEnabled = true;
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
