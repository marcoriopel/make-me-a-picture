import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPrivateGameComponent } from './join-private-game.component';

describe('JoinPrivateGameComponent', () => {
  let component: JoinPrivateGameComponent;
  let fixture: ComponentFixture<JoinPrivateGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinPrivateGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinPrivateGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
