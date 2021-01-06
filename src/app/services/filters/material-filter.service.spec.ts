import { TestBed } from '@angular/core/testing';

import { MaterialFilterService } from './material-filter.service';

describe('MaterialFilterService', () => {
  let service: MaterialFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
