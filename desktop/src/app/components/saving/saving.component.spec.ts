/* tslint:disable:no-unused-variable */
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';
import { TextService } from '@app/services/tools/text.service';
import { Subject } from 'rxjs';
import { SavingComponent } from './saving.component';

import SpyObj = jasmine.SpyObj;
// tslint:disable: no-magic-numbers
describe('SavingComponent', () => {
    let component: SavingComponent;
    let fixture: ComponentFixture<SavingComponent>;
    let databaseServiceSpy: SpyObj<DatabaseService>;
    let matDialogSpy: SpyObj<MatDialog>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let imageObservable: Subject<void>;
    let serverResponseServiceSpy: SpyObj<ServerResponseService>;
    let baseCanvas: HTMLCanvasElement;
    let baseCtx: CanvasRenderingContext2D;
    let textServiceSpy: SpyObj<TextService>;

    beforeEach(async(() => {
        baseCanvas = document.createElement('canvas');
        baseCtx = baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        serverResponseServiceSpy = jasmine.createSpyObj('ServerResponseService', ['saveConfirmSnackBar', 'saveErrorSnackBar']);
        textServiceSpy = jasmine.createSpyObj('TextService', ['createText']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
        databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['addDrawing']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        imageObservable = new Subject<void>();
        drawingServiceSpy.canvas = baseCanvas;
        drawingServiceSpy.baseCtx = baseCtx;
        databaseServiceSpy.addDrawing.and.returnValue(imageObservable.asObservable());
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SavingComponent],
            imports: [HttpClientModule, MatSnackBarModule, MatDialogModule, MatChipsModule, FormsModule, ReactiveFormsModule],
            providers: [
                { provide: ServerResponseService, useValue: serverResponseServiceSpy },
                { provide: DatabaseService, useValue: databaseServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: TextService, useValue: textServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SavingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call createText if is the tool text', () => {
        textServiceSpy.isNewText = true;
        component.ngOnInit();
        expect(textServiceSpy.createText).toHaveBeenCalled();
    });

    it('should set errorState to true if tag length is max', () => {
        component.chipList.errorState = false;
        const tag = 'tagthatismorethanfifteencharacters';
        component.currentTagInput(tag);
        expect(component.chipList.errorState).toBeTruthy();
    });

    it('should set errorState to false if tag length is not max', () => {
        component.chipList.errorState = true;
        const tag = 'smalltag';
        component.currentTagInput(tag);
        expect(component.chipList.errorState).not.toBeTruthy();
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
        expect(component.tagInput.nativeElement.disabled).toBeTruthy();
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

    it('should addDrawing', async () => {
        const dataSpy = spyOn(component.drawingService.canvas, 'toDataURL');
        await component.addDrawing();
        imageObservable.next();
        expect(serverResponseServiceSpy.saveConfirmSnackBar).toHaveBeenCalled();
        expect(dataSpy).toHaveBeenCalled();
    });

    it('should show error on add error', async () => {
        const dataSpy = spyOn(component.drawingService.canvas, 'toDataURL');
        await component.addDrawing();
        imageObservable.error('Error');
        expect(serverResponseServiceSpy.saveErrorSnackBar).toHaveBeenCalled();
        expect(dataSpy).toHaveBeenCalled();
    });

    it('should change name', () => {
        component.name = 'initialName';
        const finalName = 'finalName';
        component.changeName(finalName);
        expect(component.name).toEqual(finalName);
    });
});
