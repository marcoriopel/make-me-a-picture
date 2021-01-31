import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AttributePanelComponent } from './attribute-panel.component';

import SpyObj = jasmine.SpyObj;

describe('AttributePanelComponent', () => {
    let matdialogSpy: SpyObj<MatDialog>;

    let component: AttributePanelComponent;
    let fixture: ComponentFixture<AttributePanelComponent>;

    beforeEach(async(() => {
        matdialogSpy = jasmine.createSpyObj('dialog', ['open']);

        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: matdialogSpy }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [AttributePanelComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have toolSelectionService', () => {
        expect(component.toolSelectionService).not.toBeNull();
    });
});
