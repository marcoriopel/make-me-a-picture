/* tslint:disable:no-unused-variable */
// tslint:disable: no-magic-numbers

import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { LoadSelectedDrawingAlertComponent } from '@app/components/load-selected-drawing-alert/load-selected-drawing-alert.component';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';
import { TextService } from '@app/services/tools/text.service';
import { DBData } from '@common/communication/drawing-data';
import { of, Subject } from 'rxjs';

import SpyObj = jasmine.SpyObj;

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let resizeDrawingServiceSpy: SpyObj<ResizeDrawingService>;
    let databaseServiceSpy: SpyObj<DatabaseService>;
    let matDialogSpy: SpyObj<MatDialog>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let dBDataObservable: Subject<DBData[]>;
    let keyboardEvent: KeyboardEvent;
    let imageObservable: Subject<Blob>;
    let deleteDrawingObservable: Subject<void>;
    let baseCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let serverResponseServiceSpy: SpyObj<ServerResponseService>;
    let routerSpy: SpyObj<RouterTestingModule>;
    let textServiceSpy: SpyObj<TextService>;
    beforeEach(async(() => {
        serverResponseServiceSpy = jasmine.createSpyObj('ServerResponseService', ['deleteErrorSnackBar', 'loadErrorSnackBar']);
        resizeDrawingServiceSpy = jasmine.createSpyObj('ResizeDrawingService', ['resizeCanvasSize']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
        databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['getAllDBData', 'getDrawingPng', 'deleteDrawing']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank', 'resetStack']);
        textServiceSpy = jasmine.createSpyObj('TextService', ['createText']);
        dBDataObservable = new Subject<DBData[]>();
        imageObservable = new Subject<Blob>();
        deleteDrawingObservable = new Subject<void>();
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);
        drawingServiceSpy.baseCtx = baseCtxSpy;
        databaseServiceSpy.getAllDBData.and.returnValue(dBDataObservable.asObservable());
        databaseServiceSpy.getDrawingPng.and.returnValue(imageObservable.asObservable());
        databaseServiceSpy.deleteDrawing.and.returnValue(deleteDrawingObservable.asObservable());
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [CarouselComponent],
            imports: [HttpClientModule, MatDialogModule, RouterTestingModule, MatChipsModule],
            providers: [
                { provide: ServerResponseService, useValue: serverResponseServiceSpy },
                { provide: DatabaseService, useValue: databaseServiceSpy },
                { provide: ResizeDrawingService, useValue: resizeDrawingServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: TextService, useValue: textServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        routerSpy = spyOn(component.router, 'navigateByUrl');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call createText if is the tool text', () => {
        textServiceSpy.isNewText = true;
        component.ngOnInit();
        expect(textServiceSpy.createText).toHaveBeenCalled();
    });

    it('should disable the check of arrow presses on disableEvents call', () => {
        component.isArrowEventsChecked = true;
        component.disableEvents();
        expect(component.isArrowEventsChecked).toEqual(false);
    });

    it('should enable the check of arrow presses on enableEvents call', () => {
        component.isArrowEventsChecked = false;
        component.enableEvents();
        expect(component.isArrowEventsChecked).toEqual(true);
    });

    it('should call previous click with arrow event activated and left arrow press', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.isArrowEventsChecked = true;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const previousSpy = spyOn(component, 'onPreviousClick');
        component.onKeyDown(keyboardEvent);
        expect(previousSpy).toHaveBeenCalled();
    });

    it('should call onclicktwodrawings with 2 drawings on left', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        component.isArrowEventsChecked = true;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const twodrawingsSpy = spyOn(component, 'onClickTwoDrawings');
        component.onKeyDown(keyboardEvent);
        expect(twodrawingsSpy).toHaveBeenCalled();
    });

    it('should not do anything with 1 drawing on arrow press', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata.push(DBDATA);
        component.isArrowEventsChecked = true;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const twodrawingsSpy = spyOn(component, 'onClickTwoDrawings');
        component.onKeyDown(keyboardEvent);
        expect(twodrawingsSpy).not.toHaveBeenCalled();
    });

    it('should call onclicktwodrawings with 2 drawings on right', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        component.isArrowEventsChecked = true;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const twodrawingsSpy = spyOn(component, 'onClickTwoDrawings');
        component.onKeyDown(keyboardEvent);
        expect(twodrawingsSpy).toHaveBeenCalled();
    });

    it('should call next click with arrow event activated and right arrow press', () => {
        component.isArrowEventsChecked = true;
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const nextSpy = spyOn(component, 'onNextClick');
        component.onKeyDown(keyboardEvent);
        expect(nextSpy).toHaveBeenCalled();
    });

    it('should not call event on other key down press with 3 drawings or more', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        component.databaseMetadata.push(DBDATA);
        component.isArrowEventsChecked = true;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
        const nextSpy = spyOn(component, 'onNextClick');
        const previousSpy = spyOn(component, 'onPreviousClick');
        component.onKeyDown(keyboardEvent);
        expect(nextSpy).not.toHaveBeenCalled();
        expect(previousSpy).not.toHaveBeenCalled();
    });

    it('should not call event on other key down press', () => {
        component.isArrowEventsChecked = true;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
        const nextSpy = spyOn(component, 'onNextClick');
        component.onKeyDown(keyboardEvent);
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should not call arrow event if arrow event is false', () => {
        component.isArrowEventsChecked = false;
        keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        const nextSpy = spyOn(component, 'onNextClick');
        component.onKeyDown(keyboardEvent);
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should manage drawings after dbdata load', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        const manageSpy = spyOn(component, 'manageShownDrawings');
        dBDataObservable.next([DBDATA, DBDATA]);
        expect(manageSpy).toHaveBeenCalled();
        expect(component.databaseMetadata).toEqual([DBDATA, DBDATA]);
    });

    it('should return true if dbdata tags is array', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const answer = component.isArray(DBDATA);
        expect(answer).toEqual(true);
    });

    it('should return false if dbdata tags is not an array', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: {} as string[], fileName: 'filename' };
        const answer = component.isArray(DBDATA);
        expect(answer).toEqual(false);
    });

    it('should add only 3 drawings visible even if there is more available', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA, DBDATA, DBDATA];
        component.manageShownDrawings();
        expect(component.visibleDrawingsIndexes.length).toEqual(3);
    });

    it('should load drawing if there are 2 visible drawings and we click on interest', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const loadSpy = spyOn(component, 'loadSelectedDrawing');
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA];
        component.onPreviewClick(1);
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should call onClickTwoDrawings drawing if there are 2 visible drawings and we click other drawing', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const clickSpy = spyOn(component, 'onClickTwoDrawings');
        component.drawingOfInterest = 0;
        component.filteredMetadata = [DBDATA, DBDATA];
        component.onPreviewClick(1);
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should call onPreviousClick drawing if there are 3 visible drawings and we click on first drawing', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const clickSpy = spyOn(component, 'onPreviousClick');
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.onPreviewClick(0);
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should call onNextClick drawing if there are 3 visible drawings and we click on third drawing', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const clickSpy = spyOn(component, 'onNextClick');
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.onPreviewClick(2);
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should load drawing if there are 3 visible drawings and we click on interest', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const loadSpy = spyOn(component, 'loadSelectedDrawing');
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.onPreviewClick(1);
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should apply drawing if canvas is empty', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(true);
        const applySpy = spyOn(component, 'applySelectedDrawing');
        component.loadSelectedDrawing(1);
        expect(applySpy).toHaveBeenCalled();
    });

    it('should apply drawing if canvas is not empty and user overwrites', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(false);
        const applySpy = spyOn(component, 'applySelectedDrawing');
        const loadAlertSpy = matDialogSpy.open.and.returnValue({ afterClosed: () => of('Oui') } as MatDialogRef<LoadSelectedDrawingAlertComponent>);
        component.loadSelectedDrawing(1);

        expect(loadAlertSpy).toHaveBeenCalled();
        expect(applySpy).toHaveBeenCalled();
    });

    it('should not apply drawing if canvas is not empty and user does not overwrites', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(false);
        const applySpy = spyOn(component, 'applySelectedDrawing');
        const loadAlertSpy = matDialogSpy.open.and.returnValue({ afterClosed: () => of('Fermer') } as MatDialogRef<
            LoadSelectedDrawingAlertComponent
        >);
        component.loadSelectedDrawing(1);

        expect(loadAlertSpy).toHaveBeenCalled();
        expect(applySpy).not.toHaveBeenCalled();
    });

    it('should draw drawing', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const drawSpy = spyOn(component, 'drawImageOnCanvas');
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        const image = new Blob();
        component.applySelectedDrawing(1);
        imageObservable.next(image);

        expect(drawSpy).toHaveBeenCalled();
    });

    it('should load error snackbar on error', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.applySelectedDrawing(1);
        imageObservable.error('Error');
        expect(serverResponseServiceSpy.loadErrorSnackBar).toHaveBeenCalled();
    });

    it('should set route to editor if called from home', () => {
        component.currentRoute = '/home';
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.applySelectedDrawing(1);
        imageObservable.error('Error');
        expect(serverResponseServiceSpy.loadErrorSnackBar).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalled();
    });

    it('should drawImageOnCanvas', async () => {
        const canvasTest = document.createElement('canvas').toDataURL();
        const blob = await (await fetch(canvasTest)).blob();
        const img = URL.createObjectURL(blob);
        await component.drawImageOnCanvas(img);
        expect(baseCtxSpy.drawImage).toHaveBeenCalled();
    });

    it('should delete drawing on delete call', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const loadDBSpy = spyOn(component, 'loadDBData');
        component.drawingOfInterest = 1;
        component.visibleDrawingsIndexes.push(1);
        component.visibleDrawingsIndexes.push(1);
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA];
        component.deleteDrawing();
        deleteDrawingObservable.next();
        expect(loadDBSpy).toHaveBeenCalled();
    });

    it('should delete drawing on delete call with one drawing', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        const loadDBSpy = spyOn(component, 'loadDBData');
        component.drawingOfInterest = 0;
        component.visibleDrawingsIndexes.push(0);
        component.databaseMetadata = [DBDATA];
        component.deleteDrawing();
        deleteDrawingObservable.next();
        expect(loadDBSpy).toHaveBeenCalled();
    });

    it('should send delete snackBar on bad delete call', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.visibleDrawingsIndexes.push(1);
        component.visibleDrawingsIndexes.push(1);
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA];
        component.deleteDrawing();
        deleteDrawingObservable.error('err');
        expect(serverResponseServiceSpy.deleteErrorSnackBar).toHaveBeenCalled();
    });

    it('should switch target drawing to second on second click', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 0;
        component.filteredMetadata = [DBDATA, DBDATA];
        component.onClickTwoDrawings();
        expect(component.drawingOfInterest).toEqual(1);
    });

    it('should switch target drawing to first on first click', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA];
        component.onClickTwoDrawings();
        expect(component.drawingOfInterest).toEqual(0);
    });

    it('should switch drawings left on previous click with 4 drawings', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        // tslint:disable-next-line: no-magic-numbers
        component.visibleDrawingsIndexes = [1, 2, 3];
        component.onPreviousClick();
        expect(component.visibleDrawingsIndexes).toEqual([0, 1, 2]);
    });

    it('should switch drawings left on previous click with 3 drawings', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.visibleDrawingsIndexes = [0, 1, 2];
        component.onPreviousClick();
        expect(component.visibleDrawingsIndexes).toEqual([2, 0, 1]);
    });

    it('should switch drawings right on next click', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA];
        component.visibleDrawingsIndexes = [0, 1, 2];
        component.onNextClick();
        expect(component.visibleDrawingsIndexes).toEqual([1, 2, 0]);
    });

    it('should switch drawings right on next click with 4 drawings', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.drawingOfInterest = 1;
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.visibleDrawingsIndexes = [0, 1, 2];
        component.onNextClick();
        expect(component.visibleDrawingsIndexes).toEqual([1, 2, 3]);
    });

    it('should add tag if tag is valid', () => {
        component.tags = [];
        const value = undefined;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;
        const tag = 'smalltag';
        const event: MatChipInputEvent = { value: tag, input: target };
        component.addTag(event);
        expect(component.tags.length).toEqual(1);
    });

    it('should not set value to none if value is undefined', () => {
        component.tags = [];
        const target = (undefined as unknown) as HTMLInputElement;
        const tag = 'smalltag';
        const event: MatChipInputEvent = { value: tag, input: target };
        component.addTag(event);
        expect(event.input).toBeUndefined();
    });

    it('should not add tag if tag is empty', () => {
        component.tags = [];
        const value = undefined;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;
        const tag = '';
        const event: MatChipInputEvent = { value: tag as string, input: target };
        component.addTag(event);
        expect(component.tags.length).toEqual(0);
    });

    it('should not add tag if tag is invalid', () => {
        component.tags = [];
        const value = undefined;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;
        const tag = 'tagthatiswaytoolongtobeadded';
        const event: MatChipInputEvent = { value: tag, input: target };
        component.addTag(event);
        expect(component.tags.length).toEqual(0);
    });

    it('should not add tag if number of tag is max', () => {
        const tag = 'tagthatiswaytoolongtobeadded';
        component.tags = [tag, tag, tag, tag, tag];
        const value = undefined;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;
        const event: MatChipInputEvent = { value: tag, input: target };
        component.addTag(event);
        expect(component.maxTags).toBeTruthy();
        expect(component.tags.length).toEqual(5);
    });

    it('should remove tag if tag is valid', () => {
        const tag = 'smalltag';
        component.tags = [tag];
        component.removeTag(tag);
        expect(component.tags.length).toEqual(0);
    });

    it('should not remove tag if there is not tag to delete', () => {
        component.tags = [];
        component.removeTag('tag1');
        expect(component.tags.length).toEqual(0);
    });

    it('should remove tag if tag is valid and put replace array', () => {
        const tag1 = 'smalltag';
        const tag2 = 'tag2';
        component.tags = [tag1, tag2];
        component.removeTag(tag1);
        expect(component.tags.length).toEqual(1);
        expect(component.tags[0]).toEqual(tag2);
    });

    it('should remove tag and set maxtags to false if it was true', () => {
        component.maxTags = true;
        const tag = 'smalltag';
        component.tags = [tag, tag, tag, tag, tag];
        component.removeTag(tag);
        expect(component.tags.length).toEqual(4);
        expect(component.maxTags).toBeFalsy();
    });

    it('should show the filteredMetadata with the tags', () => {
        const tag = 'smalltag';
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', tag], fileName: 'filename' };
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.tags = [tag];
        component.showDrawingsWithFilter();
        expect(component.filteredMetadata[1].tags).toEqual(DBDATA.tags);
    });

    it('should filteredMetadata be empty if does not match any tags', () => {
        const tag = 'smalltag';
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag', 'tag2'], fileName: 'filename' };
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.tags = [tag];
        component.showDrawingsWithFilter();
        expect(component.filteredMetadata).toEqual([]);
    });

    it('should filteredMetadata be empty if does not match any tags and isNotArray', () => {
        const notArrayTag = ('smalltag' as unknown) as string[];
        const tag = 'smalltag';
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: notArrayTag, fileName: 'filename' };
        component.databaseMetadata = [DBDATA];
        component.tags = [tag];
        component.showDrawingsWithFilter();
        expect(component.filteredMetadata[0].tags).toEqual(tag);
    });

    it('should filteredMetadata be empty if does not match any tags and isnotarray', () => {
        const notArrayTag = ('smalltag' as unknown) as string[];
        const tag = 'smalltag2';
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: notArrayTag, fileName: 'filename' };
        component.databaseMetadata = [DBDATA];
        component.tags = [tag];
        component.showDrawingsWithFilter();
        expect(component.filteredMetadata.length).toEqual(0);
    });

    it('should return true if the name is to long', () => {
        const name = 'tagthatiswaytoolongtobeadded';
        expect(component.hasLengthTagError(name)).toBeTrue();
    });

    it('should return false if the name is less then 15 caractere', () => {
        const name = 'name';
        expect(component.hasLengthTagError(name)).toBeFalse();
    });
    it('should return true if the name containt space', () => {
        const name = 'gea dg';
        const haveSpace = component.hasSpaceTagError(name);
        expect(haveSpace).toEqual(true);
    });

    it('should return false if the name is less then 15 caractere', () => {
        const name = 'geadg';
        const haveSpace = component.hasSpaceTagError(name);
        expect(haveSpace).toEqual(false);
    });

    it('should keep filteredmetadata to empty if no corresponding tags', () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: [], fileName: 'filename' };
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.visibleDrawingsIndexes = [1, 2, 3];
        component.tags = ['tag'];
        component.showDrawingsWithFilter();
        expect(component.filteredMetadata.length).toEqual(0);
    });

    it('should chiplist error state be false if tag is correct ', async () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.visibleDrawingsIndexes = [1, 2, 3];
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.gotImages = true;
        const name = 'smallTag';
        fixture.detectChanges();
        await fixture.whenRenderingDone().then(() => {
            component.currentTagInput(name);
            expect(component.chipList.errorState).toEqual(false);
        });
    });

    it('should chiplist error state be true if tag is inccorrect ', async () => {
        const DBDATA: DBData = { id: 'test', name: 'meta', tags: ['tag'], fileName: 'filename' };
        component.databaseMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.visibleDrawingsIndexes = [1, 2, 3];
        component.filteredMetadata = [DBDATA, DBDATA, DBDATA, DBDATA];
        component.gotImages = true;
        const name = 'tagthatiswaytoolongtobeadded';
        fixture.detectChanges();
        await fixture.whenRenderingDone().then(() => {
            component.currentTagInput(name);
            expect(component.chipList.errorState).toEqual(true);
        });
    });
    // tslint:disable-next-line: max-file-line-count
});
