import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingSuggestionsComponent } from './drawing-suggestions.component';

describe('DrawingSuggestionsComponent', () => {
  let component: DrawingSuggestionsComponent;
  let fixture: ComponentFixture<DrawingSuggestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingSuggestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
