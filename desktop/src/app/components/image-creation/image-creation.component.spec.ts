import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCreationComponent } from './image-creation.component';

describe('ImageCreationComponent', () => {
  let component: ImageCreationComponent;
  let fixture: ComponentFixture<ImageCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
