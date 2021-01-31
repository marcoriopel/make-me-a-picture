import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MINIMUM_CANVAS_HEIGHT, MINIMUM_CANVAS_WIDTH } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ToolSelectionService } from '@app/services/tool-selection/tool-selection.service';
import { Subject } from 'rxjs';
import { DrawingComponent } from './drawing.component';

import SpyObj = jasmine.SpyObj;

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let hotkeyServiceSpy: SpyObj<HotkeyService>;
    let obs: Subject<string>;
    let toolSelectionServiceSpy: SpyObj<ToolSelectionService>;
    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(async(() => {
        obs = new Subject<string>();
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['getKey']);
        hotkeyServiceSpy.getKey.and.returnValue(obs.asObservable());
        toolSelectionServiceSpy = jasmine.createSpyObj('ToolSelectionService', [
            'changeTool',
            'setCurrentToolCursor',
            'currentToolMouseMove',
            'currentToolMouseDown',
            'currentToolMouseUp',
            'currentToolMouseLeave',
            'currentToolMouseEnter',
        ]);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['getKey', 'autoSave']);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ToolSelectionService, useValue: toolSelectionServiceSpy },
                { provide: HotkeyService, useValue: hotkeyServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        component.canvasSize = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
        component.previewSize = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a default WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        expect(height).toEqual(MINIMUM_CANVAS_HEIGHT);
        expect(width).toEqual(MINIMUM_CANVAS_WIDTH);
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        component.onMouseMove(event);
        expect(toolSelectionServiceSpy.currentToolMouseMove).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse down when receiving a mouse down event", () => {
        const event = {} as MouseEvent;
        component.onMouseDown(event);
        expect(toolSelectionServiceSpy.currentToolMouseDown).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse up when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        component.onMouseUp(event);
        expect(toolSelectionServiceSpy.currentToolMouseUp).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse enter when receiving a mouse enter event", () => {
        const event = {} as MouseEvent;
        component.onMouseEnter(event);
        expect(toolSelectionServiceSpy.currentToolMouseEnter).toHaveBeenCalled();
    });

    it(' onMouseLeave should call toolSelectionService.onMouseLeave', () => {
        component.onMouseLeave();
        expect(toolSelectionServiceSpy.currentToolMouseLeave).toHaveBeenCalled();
    });
});
