import { TestBed } from '@angular/core/testing';

import { DatasetFilterService } from './dataset-filter.service';

describe('DatasetFilterService', () => {
  let service: DatasetFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatasetFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
