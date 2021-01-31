import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ExportComponent } from '@app/components/export/export.component';
import { SavingComponent } from '@app/components/saving/saving.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { NewDrawingService } from '@app/services/new-drawing/new-drawing.service';
import { ToolSelectionService } from '@app/services/tool-selection/tool-selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';

import SpyObj = jasmine.SpyObj;
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let matdialogSpy: SpyObj<MatDialog>;
    let newDrawingServiceSpy: SpyObj<NewDrawingService>;
    let toolSelectionServiceSpy: SpyObj<ToolSelectionService>;
    let hotkeyServiceSpy: SpyObj<HotkeyService>;
    let obs: Subject<string>;
    let undoRedoServiceSpy: SpyObj<UndoRedoService>;
    let obsUndoButton: Subject<boolean>;
    let obsRedoButton: Subject<boolean>;

    beforeEach(() => {
        obs = new Subject<string>();
        obsUndoButton = new Subject<boolean>();
        obsRedoButton = new Subject<boolean>();
        toolSelectionServiceSpy = jasmine.createSpyObj('ToolSelectionService', ['changeTool', 'selectAll', 'getCurrentTool']);
        toolSelectionServiceSpy.getCurrentTool.and.returnValue(obs.asObservable());
        matdialogSpy = jasmine.createSpyObj('dialog', ['open']);
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['getKey']);
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['getUndoAvailability', 'getRedoAvailability']);
        undoRedoServiceSpy.getUndoAvailability.and.returnValue(obsUndoButton.asObservable());
        undoRedoServiceSpy.getRedoAvailability.and.returnValue(obsRedoButton.asObservable());
        newDrawingServiceSpy = jasmine.createSpyObj('newDrawingService', ['openWarningModal']);

        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SidebarComponent],
            providers: [
                { provide: ToolSelectionService, useValue: toolSelectionServiceSpy },
                { provide: NewDrawingService, useValue: newDrawingServiceSpy },
                { provide: MatDialog, useValue: matdialogSpy },
                { provide: HotkeyService, useValue: hotkeyServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('cursor should be not-allowed if undo and redo are not available', () => {
        obsRedoButton.next(false);
        obsUndoButton.next(false);
        expect(document.getElementById('undo')?.style.cursor).toEqual('not-allowed');
        expect(document.getElementById('redo')?.style.cursor).toEqual('not-allowed');
    });

    it('cursor should be pointer if undo and redo are available', () => {
        obsRedoButton.next(true);
        obsUndoButton.next(true);
        expect(document.getElementById('undo')?.style.cursor).toEqual('pointer');
        expect(document.getElementById('redo')?.style.cursor).toEqual('pointer');
    });

    it('should call toolSelectionService.changeTool', () => {
        const button = fixture.debugElement.nativeElement.querySelector('#Pinceau');
        button.click();
        expect(toolSelectionServiceSpy.changeTool).toHaveBeenCalled();
    });

    it('should call open of MatDialog', () => {
        component.openUserguide();
        expect(matdialogSpy.open).toHaveBeenCalled();
    });

    it('should call openWarningModal', () => {
        const button = fixture.debugElement.nativeElement.querySelector('#new-drawing');
        button.click();
        expect(newDrawingServiceSpy.openWarningModal).toHaveBeenCalled();
    });

    it('should call open whit the export component', () => {
        component.openExportWindow();
        expect(matdialogSpy.open).toHaveBeenCalledWith(ExportComponent);
    });

    it('should not change tool nor handle cursor on an invalid event', () => {
        const value = undefined;
        const target = ({
            value,
        } as unknown) as HTMLInputElement;
        const event = ({
            target,
        } as unknown) as InputEvent;
        component.onToolChange(event);
        expect(toolSelectionServiceSpy.changeTool).not.toHaveBeenCalled();
    });

    it('should change tool on hotkey call', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next('invalidtool');
        expect(component.selectedTool).toEqual(TOOL_NAMES.PENCIL_TOOL_NAME);
    });

    it('should not change tool on invalid hotkey call', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(TOOL_NAMES.BRUSH_TOOL_NAME);
        expect(component.selectedTool).toEqual(TOOL_NAMES.BRUSH_TOOL_NAME);
    });

    it('should open save window', () => {
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        obs.next(TOOL_NAMES.BRUSH_TOOL_NAME);
        expect(component.selectedTool).toEqual(TOOL_NAMES.BRUSH_TOOL_NAME);
    });

    it('should open carousel component on call', () => {
        component.openCarouselWindow();
        expect(matdialogSpy.open).toHaveBeenCalledWith(CarouselComponent);
    });

    it('should open save component on call', () => {
        component.openSaveWindow();
        expect(matdialogSpy.open).toHaveBeenCalledWith(SavingComponent);
    });

    it('should call selectall of tool selection service', () => {
        component.selectAll();
        expect(toolSelectionServiceSpy.selectAll).toHaveBeenCalled();
    });

    it('should open export component on call', () => {
        component.openExportWindow();
        expect(matdialogSpy.open).toHaveBeenCalledWith(ExportComponent);
    });
});
