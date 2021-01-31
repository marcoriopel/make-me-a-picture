import { TestBed } from '@angular/core/testing';

import { SelectionResizeService } from './selection-resize.service';

describe('SelectionResizeService', () => {
  let service: SelectionResizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionResizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
