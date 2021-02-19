import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import {
    MINIMUM_CANVAS_HEIGHT,
    MINIMUM_CANVAS_WIDTH,
    MINIMUM_WORKSPACE_HEIGHT,
    MINIMUM_WORKSPACE_WIDTH,
} from '@app/ressources/global-variables/global-variables';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ToolSelectionService } from '@app/services/tool-selection/tool-selection.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('drawingComponent', { static: false }) drawingComponent: DrawingComponent;
    @ViewChild('workSpace', { static: false }) workSpaceRef: ElementRef<HTMLDivElement>;
    @ViewChild('previewDiv', { static: false }) previewDivRef: ElementRef<HTMLDivElement>;

    workSpaceSize: Vec2 = { x: MINIMUM_WORKSPACE_WIDTH, y: MINIMUM_WORKSPACE_HEIGHT };
    previewSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    canvasSize: Vec2 = { x: MINIMUM_CANVAS_WIDTH, y: MINIMUM_CANVAS_HEIGHT };
    previewDiv: HTMLDivElement;

    shortcutsArray: string[] = ['c', 'e', 'z', 'Z', 'g'];

    constructor(
        public hotkeyService: HotkeyService,
        public toolSelectionService: ToolSelectionService,
    ) {
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const workspaceElement: HTMLElement = this.workSpaceRef.nativeElement;
            this.workSpaceSize.x = workspaceElement.offsetWidth;
            this.workSpaceSize.y = workspaceElement.offsetHeight;
            this.previewDiv = this.previewDivRef.nativeElement;
            this.previewDiv.style.display = 'none';
            this.previewDiv.style.borderWidth = '1px';
            this.previewDiv.style.borderColor = '#09acd9';
            this.previewDiv.style.borderStyle = 'dashed';
            this.previewDiv.style.position = 'absolute';
        });
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolSelectionService.currentToolKeyUp(event);
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.shortcutsArray.includes(event.key)) {
            this.hotkeyService.onKeyDown(event);
        }
        this.toolSelectionService.currentToolKeyDown(event);
    }

    onMouseDown(event: MouseEvent): void {
        this.previewDiv.style.display = 'block';
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.previewDiv.style.display = 'none';
    }
}
