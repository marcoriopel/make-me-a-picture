import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoopGameComponent } from './sprint-game.component';

describe('CoopGameComponent', () => {
  let component: CoopGameComponent;
  let fixture: ComponentFixture<CoopGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoopGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoopGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
