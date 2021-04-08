import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndGameDrawingComponent } from './end-game-drawing.component';

describe('EndGameDrawingComponent', () => {
  let component: EndGameDrawingComponent;
  let fixture: ComponentFixture<EndGameDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndGameDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndGameDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
