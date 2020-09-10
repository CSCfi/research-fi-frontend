import { TestBed } from '@angular/core/testing';

import { FundingFilterService } from './funding-filter.service';

describe('FundingFilterService', () => {
  let service: FundingFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FundingFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
