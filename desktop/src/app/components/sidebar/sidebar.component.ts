import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TOOLTIP_DELAY } from '@app/ressources/global-variables/global-variables';
import { SidebarElementTooltips, SIDEBAR_ELEMENT_TOOLTIPS } from '@app/ressources/global-variables/sidebar-element-tooltips';
import { ToolNames, TOOL_NAMES, TOOL_NAMES_ARRAY } from '@app/ressources/global-variables/tool-names';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ToolSelectionService } from '@app/services/tool-selection/tool-selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('undo', { read: ElementRef }) undoButton: ElementRef;
    @ViewChild('redo', { read: ElementRef }) redoButton: ElementRef;
    destroy$: Subject<boolean> = new Subject<boolean>();
    elementDescriptions: SidebarElementTooltips = SIDEBAR_ELEMENT_TOOLTIPS;
    tooltipShowDelay: number = TOOLTIP_DELAY;
    toolNames: ToolNames = TOOL_NAMES;
    selectedTool: string = this.toolNames.PENCIL_TOOL_NAME;

    constructor(
        public toolSelectionService: ToolSelectionService,
        public dialog: MatDialog,
        public undoRedoService: UndoRedoService,
        public hotkeyService: HotkeyService
    ) {}

    ngOnInit(): void {
        this.toolSelectionService
            .getCurrentTool()
            .pipe(takeUntil(this.destroy$))
            .subscribe((tool) => {
                if (TOOL_NAMES_ARRAY.includes(tool)) {
                    this.selectedTool = tool;
                }
            });
    }

    ngAfterViewInit(): void {
        this.undoRedoService.getUndoAvailability().subscribe((value) => {
            if (value) {
                this.undoButton.nativeElement.style.cursor = 'pointer';
                this.undoButton.nativeElement.style.opacity = '1';
            } else {
                this.undoButton.nativeElement.style.cursor = 'not-allowed';
                this.undoButton.nativeElement.style.opacity = '0.5';
            }
        });

        this.undoRedoService.getRedoAvailability().subscribe((value) => {
            if (value) {
                this.redoButton.nativeElement.style.cursor = 'pointer';
                this.redoButton.nativeElement.style.opacity = '1';
            } else {
                this.redoButton.nativeElement.style.cursor = 'not-allowed';
                this.redoButton.nativeElement.style.opacity = '0.5';
            }
        });


    }

    onToolChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.value != undefined) {
            this.toolSelectionService.changeTool(target.value);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

}
