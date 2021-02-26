import { TestBed } from '@angular/core/testing';

import { SearchGameService } from './search-game.service';

describe('SearchGameService', () => {
  let service: SearchGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
